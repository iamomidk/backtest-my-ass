import React from 'react'
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Percent } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { BacktestResult } from '../../hooks/useBacktestData'

interface MetricsGridProps {
  data: BacktestResult[]
}

export function MetricsGrid({ data }: MetricsGridProps) {
  // Calculate metrics
  const validTrades = data.filter(item => 
    (item.pnl !== null && item.pnl !== undefined) || 
    (item['P&L ($)'] !== null && item['P&L ($)'] !== undefined)
  )
  const totalTrades = validTrades.length
  const totalPnL = validTrades.reduce((sum, item) => 
    sum + (item.pnl || item['P&L ($)'] || 0), 0)
  const winningTrades = validTrades.filter(item => 
    (item.pnl || item['P&L ($)'] || 0) > 0)
  const losingTrades = validTrades.filter(item => 
    (item.pnl || item['P&L ($)'] || 0) < 0)
  
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0
  const avgWin = winningTrades.length > 0 ? 
    winningTrades.reduce((sum, item) => sum + (item.pnl || item['P&L ($)'] || 0), 0) / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? 
    Math.abs(losingTrades.reduce((sum, item) => sum + (item.pnl || item['P&L ($)'] || 0), 0) / losingTrades.length) : 0
  
  const totalWins = winningTrades.reduce((sum, item) => sum + (item.pnl || item['P&L ($)'] || 0), 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, item) => sum + (item.pnl || item['P&L ($)'] || 0), 0))
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : (totalWins > 0 ? 999 : 0)
  
  // Calculate max drawdown from equity curve
  const equityValues = data
    .filter(item => 
      (item.equity_after_trade !== null && item.equity_after_trade !== undefined) ||
      (item['Ending Equity'] !== null && item['Ending Equity'] !== undefined)
    )
    .sort((a, b) => {
      const dateA = new Date(a.exit_time || a.ClosedAt || 0).getTime()
      const dateB = new Date(b.exit_time || b.ClosedAt || 0).getTime()
      return dateA - dateB
    })
    .map(item => item.equity_after_trade || item['Ending Equity'] || 1000)
  
  let maxDrawdown = 0
  let peak = equityValues[0] || 1000
  
  equityValues.forEach(equity => {
    if (equity > peak) {
      peak = equity
    } else {
      const drawdown = ((peak - equity) / peak) * 100
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }
  })

  const metrics = [
    {
      title: 'Total P&L',
      value: `$${totalPnL.toFixed(2)}`,
      icon: DollarSign,
      color: totalPnL >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Trades',
      value: totalTrades.toString(),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Profit Factor',
      value: profitFactor.toFixed(2),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Max Drawdown',
      value: `${maxDrawdown.toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Avg Win/Loss',
      value: `$${avgWin.toFixed(0)}/$${avgLoss.toFixed(0)}`,
      icon: Percent,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}