import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { NormalizedTrade } from '../../types/database'

interface PnLDistributionProps {
  data: NormalizedTrade[]
}

export function PnLDistribution({ data }: PnLDistributionProps) {
  // Create PnL distribution buckets
  const pnlValues = data
    .filter(item => 
      item.pnl !== null && item.pnl !== undefined
    )
    .map(item => item.pnl!)

  if (pnlValues.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No P&L data available
      </div>
    )
  }

  const minPnL = Math.min(...pnlValues)
  const maxPnL = Math.max(...pnlValues)
  const bucketSize = (maxPnL - minPnL) / 10
  
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const start = minPnL + i * bucketSize
    const end = start + bucketSize
    const count = pnlValues.filter(pnl => pnl >= start && pnl < end).length
    
    return {
      range: `${start.toFixed(0)} to ${end.toFixed(0)}`,
      count,
      midpoint: (start + end) / 2
    }
  })

  const formatTooltip = (value: any, name: string) => {
    if (name === 'count') {
      return [`${value} trades`, 'Trade Count']
    }
    return [value, name]
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
          <XAxis 
            dataKey="range" 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            fontSize={12}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#374151'
            }}
            contentClassName="dark:!bg-gray-800 dark:!border-gray-600 dark:!text-white"
          />
          <Bar 
            dataKey="count" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}