import { NormalizedTrade, DashboardMetrics } from '../types/database'

export class MetricsCalculator {
  static calculateDashboardMetrics(trades: NormalizedTrade[]): DashboardMetrics {
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined)
    const totalTrades = closedTrades.length

    if (totalTrades === 0) {
      return this.getEmptyMetrics()
    }

    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0)
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0)
    
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winRate = (winningTrades.length / totalTrades) * 100
    
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0))
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : (totalWins > 0 ? 999 : 0)
    
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
    
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0
    
    // Calculate max drawdown
    const equityValues = this.calculateEquityCurve(closedTrades)
    const maxDrawdown = this.calculateMaxDrawdown(equityValues)
    
    // Calculate Sharpe ratio (simplified)
    const returns = closedTrades.map(t => (t.pnl || 0) / 1000) // Assuming $1000 base
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const returnStdDev = this.calculateStandardDeviation(returns)
    const sharpeRatio = returnStdDev > 0 ? (avgReturn / returnStdDev) * Math.sqrt(252) : 0
    
    // Calculate average trade duration
    const avgTradeDuration = this.calculateAverageTradeDuration(closedTrades)
    
    const finalEquity = equityValues.length > 0 ? equityValues[equityValues.length - 1] : 10000
    const totalReturn = ((finalEquity - 10000) / 10000) * 100

    return {
      totalTrades,
      winRate,
      totalPnL,
      finalEquity,
      maxDrawdown,
      profitFactor,
      sharpeRatio,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      avgTradeDuration,
      totalReturn
    }
  }

  private static getEmptyMetrics(): DashboardMetrics {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      finalEquity: 10000,
      maxDrawdown: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      avgTradeDuration: 0,
      totalReturn: 0
    }
  }

  private static calculateEquityCurve(trades: NormalizedTrade[]): number[] {
    const sortedTrades = trades
      .filter(t => t.exit_time)
      .sort((a, b) => new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime())
    
    const equity = [10000] // Starting equity
    let currentEquity = 10000
    
    sortedTrades.forEach(trade => {
      currentEquity += (trade.pnl || 0)
      equity.push(currentEquity)
    })
    
    return equity
  }

  private static calculateMaxDrawdown(equityValues: number[]): number {
    let maxDrawdown = 0
    let peak = equityValues[0] || 10000
    
    equityValues.forEach(equity => {
      if (equity > peak) {
        peak = equity
      } else {
        const drawdown = ((peak - equity) / peak) * 100
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    })
    
    return maxDrawdown
  }

  private static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
    
    return Math.sqrt(avgSquaredDiff)
  }

  private static calculateAverageTradeDuration(trades: NormalizedTrade[]): number {
    const tradesWithDuration = trades.filter(t => t.entry_time && t.exit_time)
    
    if (tradesWithDuration.length === 0) return 0
    
    const totalDuration = tradesWithDuration.reduce((sum, trade) => {
      const entryTime = new Date(trade.entry_time).getTime()
      const exitTime = new Date(trade.exit_time!).getTime()
      return sum + (exitTime - entryTime)
    }, 0)
    
    return totalDuration / tradesWithDuration.length / (1000 * 60 * 60) // Convert to hours
  }
}