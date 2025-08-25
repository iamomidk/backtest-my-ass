import { TradeSignal, BacktestResult, NormalizedTrade, DataQualityMetrics } from '../types/database'

export class DataProcessor {
  private static instance: DataProcessor
  private dataQualityMetrics: DataQualityMetrics | null = null

  static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor()
    }
    return DataProcessor.instance
  }

  /**
   * Normalize trade data from various sources into a unified format
   */
  normalizeTradeData(signals: TradeSignal[], results: BacktestResult[]): NormalizedTrade[] {
    const normalizedTrades: NormalizedTrade[] = []
    
    // Process trade signals
    signals.forEach(signal => {
      const normalized: NormalizedTrade = {
        id: signal.SignalID,
        symbol: this.cleanSymbol(signal.Symbol),
        side: this.normalizeSide(signal.Action),
        entry_time: this.normalizeTimestamp(signal.Timestamp),
        exit_time: signal.ClosedAt ? this.normalizeTimestamp(signal.ClosedAt) : undefined,
        entry_price: this.validateNumber(signal.Entry),
        exit_price: signal.ClosingPrice ? this.validateNumber(signal.ClosingPrice) : undefined,
        stop_loss: this.validateNumber(signal.StopLoss),
        take_profit: this.validateNumber(signal.TakeProfit),
        leverage: signal.Leverage || 1,
        confidence_score: signal.ConfidenceScore,
        ai_rationale: signal.AI_Rationale,
        status: signal.ClosedAt ? 'closed' : (signal.Status === 'active' ? 'open' : 'pending')
      }
      normalizedTrades.push(normalized)
    })

    // Process backtest results and merge with signals
    results.forEach(result => {
      const existingTrade = normalizedTrades.find(t => t.id === result.SignalID)
      if (existingTrade) {
        existingTrade.pnl = this.validateNumber(result['P&L ($)'])
        existingTrade.equity_after_trade = this.validateNumber(result['Ending Equity'])
        existingTrade.tp_multiplier = this.validateNumber(result['Risk/Reward'])
        existingTrade.exit_reason = this.normalizeExitReason(result.Outcome)
        existingTrade.status = 'closed'
      } else {
        // Create new trade from backtest result
        const normalized: NormalizedTrade = {
          id: result.SignalID || `bt_${Date.now()}_${Math.random()}`,
          symbol: this.cleanSymbol(result.Symbol || ''),
          side: this.normalizeSide(result.Action || ''),
          entry_time: result.ClosedAt || new Date().toISOString(),
          exit_time: result.ClosedAt,
          entry_price: this.validateNumber(result.Entry),
          exit_price: this.calculateExitPrice(result.Entry, result['P&L ($)'], result.Action),
          stop_loss: this.validateNumber(result.StopLoss),
          take_profit: this.validateNumber(result.TakeProfit),
          pnl: this.validateNumber(result['P&L ($)']),
          equity_after_trade: this.validateNumber(result['Ending Equity']),
          tp_multiplier: this.validateNumber(result['Risk/Reward']),
          exit_reason: this.normalizeExitReason(result.Outcome),
          leverage: result.Leverage || 1,
          status: 'closed'
        }
        normalizedTrades.push(normalized)
      }
    })

    return this.removeDuplicates(normalizedTrades)
  }

  /**
   * Calculate data quality metrics
   */
  calculateDataQuality(trades: NormalizedTrade[]): DataQualityMetrics {
    const totalRecords = trades.length
    let validRecords = 0
    let duplicates = 0
    const missingValues: { [key: string]: number } = {}

    const requiredFields = ['id', 'symbol', 'side', 'entry_time', 'entry_price', 'stop_loss', 'take_profit']
    
    // Initialize missing values counter
    requiredFields.forEach(field => {
      missingValues[field] = 0
    })

    // Check for duplicates
    const ids = new Set()
    trades.forEach(trade => {
      if (ids.has(trade.id)) {
        duplicates++
      } else {
        ids.add(trade.id)
      }
    })

    // Validate each record
    trades.forEach(trade => {
      let isValid = true
      
      requiredFields.forEach(field => {
        const value = (trade as any)[field]
        if (value === null || value === undefined || value === '' || 
            (typeof value === 'number' && isNaN(value))) {
          missingValues[field]++
          isValid = false
        }
      })

      if (isValid) validRecords++
    })

    const dataIntegrityScore = totalRecords > 0 ? 
      Math.round(((validRecords - duplicates) / totalRecords) * 100) : 0

    this.dataQualityMetrics = {
      totalRecords,
      validRecords,
      duplicates,
      missingValues,
      dataIntegrityScore,
      lastUpdated: new Date().toISOString()
    }

    return this.dataQualityMetrics
  }

  getDataQualityMetrics(): DataQualityMetrics | null {
    return this.dataQualityMetrics
  }

  private cleanSymbol(symbol: string): string {
    if (!symbol) return 'UNKNOWN'
    return symbol.toUpperCase().replace(/[^A-Z0-9]/g, '')
  }

  private normalizeSide(action: string): 'long' | 'short' {
    if (!action) return 'long'
    const normalized = action.toLowerCase()
    return normalized.includes('short') || normalized.includes('sell') ? 'short' : 'long'
  }

  private normalizeTimestamp(timestamp: string | undefined): string {
    if (!timestamp) return new Date().toISOString()
    try {
      return new Date(timestamp).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  private validateNumber(value: any): number {
    if (typeof value === 'number' && !isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  private normalizeExitReason(outcome: string | undefined): string {
    if (!outcome) return 'unknown'
    const normalized = outcome.toLowerCase()
    if (normalized.includes('win') || normalized.includes('profit')) return 'take_profit'
    if (normalized.includes('loss') || normalized.includes('stop')) return 'stop_loss'
    return 'unknown'
  }

  private calculateExitPrice(entryPrice: any, pnl: any, action: any): number {
    const entry = this.validateNumber(entryPrice)
    const profit = this.validateNumber(pnl)
    const side = this.normalizeSide(action || '')
    
    if (entry === 0) return 0
    
    // Simplified calculation - in reality this would be more complex
    const returnPct = profit / (entry * 100) // Assuming $100 position size
    return side === 'long' ? entry * (1 + returnPct) : entry * (1 - returnPct)
  }

  private removeDuplicates(trades: NormalizedTrade[]): NormalizedTrade[] {
    const seen = new Set()
    return trades.filter(trade => {
      if (seen.has(trade.id)) {
        return false
      }
      seen.add(trade.id)
      return true
    })
  }
}