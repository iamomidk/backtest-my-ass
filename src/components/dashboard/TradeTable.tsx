import React, { useState } from 'react'
import { format } from 'date-fns'
import { ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { BacktestResult } from '../../hooks/useBacktestData'

interface TradeTableProps {
  data: BacktestResult[]
}

type SortField = 'exit_time' | 'pnl' | 'entry_price' | 'symbol'
type SortDirection = 'asc' | 'desc'

export function TradeTable({ data }: TradeTableProps) {
  const [sortField, setSortField] = useState<SortField>('exit_time')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterOutcome, setFilterOutcome] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredData = data.filter(item => {
    if (filterOutcome === 'all') return true
    if (filterOutcome === 'winning') return (item.pnl || 0) > 0
    if (filterOutcome === 'losing') return (item.pnl || 0) < 0
    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'exit_time') {
      aValue = new Date(aValue || 0).getTime()
      bValue = new Date(bValue || 0).getTime()
    }

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trade History</CardTitle>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Trades</option>
              <option value="winning">Winning Trades</option>
              <option value="losing">Losing Trades</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort('exit_time')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <SortIcon field="exit_time" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Symbol</span>
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Side</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort('entry_price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Entry</span>
                    <SortIcon field="entry_price" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Exit</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort('pnl')}
                >
                  <div className="flex items-center space-x-1">
                    <span>P&L</span>
                    <SortIcon field="pnl" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">TP Multiplier</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Exit Reason</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((trade, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    {trade.exit_time ? format(new Date(trade.exit_time), 'MMM dd, HH:mm') : '-'}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{trade.symbol || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={trade.side === 'long' ? 'success' : 'error'} size="sm">
                      {trade.side?.toUpperCase() || '-'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">${trade.entry_price?.toFixed(4) || '-'}</td>
                  <td className="py-3 px-4">${trade.exit_price?.toFixed(4) || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      (trade.pnl || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${trade.pnl?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{trade.tp_multiplier?.toFixed(1) || '-'}x</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        trade.exit_reason === 'final_tp' || trade.exit_reason === 'partial_tp' ? 'success' : 
                        trade.exit_reason === 'stop_loss' ? 'error' : 'default'
                      }
                      size="sm"
                    >
                      {trade.exit_reason?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} trades
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}