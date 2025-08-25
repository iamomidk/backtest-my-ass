import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { BacktestResult } from '../../hooks/useBacktestData'

interface PerformanceChartProps {
  data: BacktestResult[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  // Process data for equity curve
  const chartData = data
    .filter(item => item.exit_time && item.equity_after_trade !== null)
    .sort((a, b) => new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime())
    .map((item, index) => ({
      date: item.exit_time!,
      equity: item.equity_after_trade!,
      pnl: item.pnl!,
      trade: index + 1
    }))

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No equity data available
      </div>
    )
  }
  const formatTooltip = (value: any, name: string) => {
    if (name === 'equity') {
      return [`$${value.toFixed(2)}`, 'Portfolio Equity']
    }
    return [value, name]
  }

  const formatXAxisLabel = (tickItem: string) => {
    return format(new Date(tickItem), 'MMM dd')
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm')}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#374151'
            }}
            contentClassName="dark:!bg-gray-800 dark:!border-gray-600 dark:!text-white"
          />
          <Line 
            type="monotone" 
            dataKey="equity" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}