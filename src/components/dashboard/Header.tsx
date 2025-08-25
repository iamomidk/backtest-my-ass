import React from 'react'
import { BarChart3, RefreshCw, Database } from 'lucide-react'
import { Button } from '../ui/Button'
import { DarkModeToggle } from '../ui/DarkModeToggle'
import { useDarkMode } from '../../hooks/useDarkMode'

interface HeaderProps {
  onRefresh: () => void
  loading: boolean
}

export function Header({ onRefresh, loading }: HeaderProps) {
  const { isDark, toggleDarkMode } = useDarkMode()

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crypto Backtesting Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced cryptocurrency trading analysis and optimization
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Database className="h-4 w-4" />
            <span>Connected to Supabase</span>
          </div>
          <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />
          <Button
            variant="outline"
            onClick={onRefresh}
            loading={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>
    </div>
  )
}