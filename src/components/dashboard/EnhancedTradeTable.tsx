import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ChevronUp, ChevronDown, Filter, Download, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { NormalizedTrade } from '../../types/database'

interface EnhancedTradeTableProps {
  data: NormalizedTrade[]
}

type SortField = keyof NormalizedTrade
type SortDirection = 'asc' | 'desc'

export function EnhancedTradeTable({ data }: EnhancedTradeTableProps) {
  const [sortField, setSortField] = useState<SortField>('exit_time')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSymbol, setFilterSymbol] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  const symbols = useMemo(() => {
    const uniqueSymbols = [...new Set(data.map(item => item.symbol))].sort()
    return uniqueSymbols
  }, [data])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'winning' && (item.pnl || 0) <= 0) return false
        if (filterStatus === 'losing' && (item.pnl || 0) >= 0) return false
        if (filterStatus !== 'winning' && filterStatus !== 'losing' && item.status !== filterStatus) return false
      }
      
      // Symbol filter
      if (filterSymbol !== 'all' && item.symbol !== filterSymbol) return false
      
      // Search filter
      if (searchTerm && !item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.id.toLowerCase().includes(searchTerm.toLowerCase())) return false
      
      return true
    })
  }, [data, filterStatus, filterSymbol, searchTerm])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'exit_time' || sortField === 'entry_time') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredData, sortField, sortDirection])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const exportToCSV = () => {
    const headers = ['ID', 'Symbol', 'Side', 'Entry Time', 'Exit Time', 'Entry Price', 'Exit Price', 'P&L', 'Status']
    const csvContent = [
      headers.join(','),
      ...sortedData.map(trade => [
        trade.id,
        trade.symbol,
        trade.side,
        trade.entry_time,
        trade.exit_time || '',
        trade.entry_price,
        trade.exit_price || '',
        trade.pnl || '',
        trade.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <CardTitle>Trade History ({filteredData.length} trades)</CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="winning">Winning</option>
                <option value="losing">Losing</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Symbols</option>
                {symbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>
            
            {/* Export */}
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
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
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <SortIcon field="id" />
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
                  onClick={() => handleSort('entry_time')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Entry</span>
                    <SortIcon field="entry_time" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort('exit_time')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Exit</span>
                    <SortIcon field="exit_time" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort('entry_price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Entry Price</span>
                    <SortIcon field="entry_price" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Exit Price</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort('pnl')}
                >
                  <div className="flex items-center space-x-1">
                    <span>P&L</span>
                    <SortIcon field="pnl" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((trade, index) => (
                <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 font-mono text-xs">{trade.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{trade.symbol}</td>
                  <td className="py-3 px-4">
                    <Badge variant={trade.side === 'long' ? 'success' : 'error'} size="sm">
                      {trade.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {format(new Date(trade.entry_time), 'MMM dd, HH:mm')}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {trade.exit_time ? format(new Date(trade.exit_time), 'MMM dd, HH:mm') : '-'}
                  </td>
                  <td className="py-3 px-4">${trade.entry_price.toFixed(4)}</td>
                  <td className="py-3 px-4">{trade.exit_price ? `$${trade.exit_price.toFixed(4)}` : '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      (trade.pnl || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        trade.status === 'closed' ? 'default' :
                        trade.status === 'open' ? 'info' : 'warning'
                      }
                      size="sm"
                    >
                      {trade.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {trade.confidence_score ? (
                      <Badge 
                        variant={
                          trade.confidence_score >= 80 ? 'success' :
                          trade.confidence_score >= 60 ? 'warning' : 'error'
                        }
                        size="sm"
                      >
                        {trade.confidence_score}%
                      </Badge>
                    ) : '-'}
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