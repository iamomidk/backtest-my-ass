import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface TradeSignal {
  SignalID: string
  Timestamp: string
  Symbol: string
  Status: string
  Action: string
  Entry: number
  StopLoss: number
  TakeProfit: number
  AI_Rationale?: string
  Leverage?: number
  ConfidenceScore?: number
}

interface BacktestConfig {
  initialEquity: number
  riskPerTrade: number
  maxConcurrentTrades: number
  tpMultipliers: number[]
  volumeSpikeThreshold: number
  emaFilter: boolean
}

class BacktestEngine {
  private config: BacktestConfig
  private equity: number
  private activeTrades: Map<string, any> = new Map()
  private completedTrades: any[] = []

  constructor(config: BacktestConfig) {
    this.config = config
    this.equity = config.initialEquity
  }

  async runBacktest(signals: TradeSignal[]): Promise<any[]> {
    console.log(`Starting backtest with ${signals.length} signals`)
    
    // Sort signals by timestamp
    const sortedSignals = signals.sort((a, b) => 
      new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
    )

    for (const signal of sortedSignals) {
      await this.processSignal(signal)
    }

    // Close any remaining active trades
    for (const [signalId, trade] of this.activeTrades) {
      this.closeTrade(signalId, signal.Entry, 'backtest_end')
    }

    return this.completedTrades
  }

  private async processSignal(signal: TradeSignal) {
    // Skip if we already have this trade
    if (this.activeTrades.has(signal.SignalID)) {
      return
    }

    // Check if we can open a new trade
    if (this.activeTrades.size >= this.config.maxConcurrentTrades) {
      return
    }

    // Calculate position size based on risk
    const riskAmount = this.equity * (this.config.riskPerTrade / 100)
    const stopDistance = Math.abs(signal.Entry - signal.StopLoss)
    const positionSize = riskAmount / stopDistance

    // Create new trade
    const trade = {
      signalId: signal.SignalID,
      symbol: signal.Symbol,
      action: signal.Action,
      entryPrice: signal.Entry,
      stopLoss: signal.StopLoss,
      takeProfit: signal.TakeProfit,
      positionSize,
      entryTime: signal.Timestamp,
      leverage: signal.Leverage || 1,
      confidenceScore: signal.ConfidenceScore
    }

    this.activeTrades.set(signal.SignalID, trade)
    console.log(`Opened trade: ${signal.SignalID} for ${signal.Symbol}`)
  }

  private closeTrade(signalId: string, exitPrice: number, exitReason: string) {
    const trade = this.activeTrades.get(signalId)
    if (!trade) return

    // Calculate P&L
    const isLong = trade.action.toLowerCase() === 'long' || trade.action.toLowerCase() === 'buy'
    const priceChange = isLong ? 
      (exitPrice - trade.entryPrice) : 
      (trade.entryPrice - exitPrice)
    
    const pnl = (priceChange / trade.entryPrice) * trade.positionSize * trade.leverage
    
    // Update equity
    this.equity += pnl

    // Calculate risk/reward ratio
    const riskReward = Math.abs(pnl / (trade.positionSize * Math.abs(trade.entryPrice - trade.stopLoss) / trade.entryPrice))

    // Create completed trade record
    const completedTrade = {
      SignalID: signalId,
      Symbol: trade.symbol,
      Action: trade.action,
      Entry: trade.entryPrice,
      StopLoss: trade.stopLoss,
      TakeProfit: trade.takeProfit,
      Leverage: trade.leverage,
      Outcome: pnl > 0 ? 'Win' : 'Loss',
      ClosedAt: new Date().toISOString(),
      'P&L ($)': pnl,
      'Risk/Reward': riskReward,
      'Ending Equity': this.equity
    }

    this.completedTrades.push(completedTrade)
    this.activeTrades.delete(signalId)
    
    console.log(`Closed trade: ${signalId}, P&L: $${pnl.toFixed(2)}, Equity: $${this.equity.toFixed(2)}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch trade signals
    const { data: signals, error: signalsError } = await supabase
      .from('ai_trade_log')
      .select('*')
      .order('Timestamp', { ascending: true })

    if (signalsError) {
      throw new Error(`Failed to fetch signals: ${signalsError.message}`)
    }

    console.log(`Fetched ${signals?.length || 0} trade signals`)

    // Configure backtest
    const config: BacktestConfig = {
      initialEquity: 10000,
      riskPerTrade: 2.0,
      maxConcurrentTrades: 5,
      tpMultipliers: [2.0, 2.5, 3.0],
      volumeSpikeThreshold: 1.5,
      emaFilter: true
    }

    // Run backtest
    const engine = new BacktestEngine(config)
    const results = await engine.runBacktest(signals || [])

    console.log(`Backtest completed with ${results.length} trades`)

    // Clear existing results
    const { error: deleteError } = await supabase
      .from('backtest_results')
      .delete()
      .neq('SignalID', '')

    if (deleteError) {
      console.warn('Failed to clear existing results:', deleteError.message)
    }

    // Save results to database
    if (results.length > 0) {
      const { error: insertError } = await supabase
        .from('backtest_results')
        .insert(results)

      if (insertError) {
        throw new Error(`Failed to save results: ${insertError.message}`)
      }
    }

    // Calculate summary statistics
    const totalTrades = results.length
    const winningTrades = results.filter(t => t['P&L ($)'] > 0).length
    const totalPnL = results.reduce((sum, t) => sum + t['P&L ($)'], 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const summary = {
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      winRate: winRate.toFixed(1),
      totalPnL: totalPnL.toFixed(2),
      finalEquity: results[results.length - 1]?.['Ending Equity'] || config.initialEquity
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backtest completed successfully',
        summary,
        tradesProcessed: results.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Backtest error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})