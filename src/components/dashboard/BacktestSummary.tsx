import React from 'react'
import { TrendingUp, Target, DollarSign, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface BacktestSummaryProps {
  totalTrades: number
  winRate: number
  totalPnL: number
  finalEquity: number
  maxDrawdown: number
  profitFactor: number
}

export function BacktestSummary({ 
  totalTrades, 
  winRate, 
  totalPnL, 
  finalEquity, 
  maxDrawdown, 
  profitFactor 
}: BacktestSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span>Backtest Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTrades}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{winRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className={`h-8 w-8 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPnL.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">${finalEquity.toFixed(2)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Final Equity</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{maxDrawdown.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Badge variant={profitFactor > 1 ? 'success' : 'error'}>
                {profitFactor > 1 ? 'Profitable' : 'Unprofitable'}
              </Badge>
            </div>
            <p className={`text-2xl font-bold ${profitFactor > 1 ? 'text-green-600' : 'text-red-600'}`}>
              {profitFactor.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Profit Factor</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}