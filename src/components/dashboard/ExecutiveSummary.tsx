import React from 'react'
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { DashboardMetrics, DataQualityMetrics } from '../../types/database'

interface ExecutiveSummaryProps {
  metrics: DashboardMetrics
  dataQuality: DataQualityMetrics | null
}

export function ExecutiveSummary({ metrics, dataQuality }: ExecutiveSummaryProps) {
  const getPerformanceStatus = () => {
    if (metrics.totalReturn > 10) return { status: 'excellent', color: 'success', icon: TrendingUp }
    if (metrics.totalReturn > 0) return { status: 'good', color: 'success', icon: TrendingUp }
    if (metrics.totalReturn > -10) return { status: 'poor', color: 'warning', icon: TrendingDown }
    return { status: 'critical', color: 'error', icon: TrendingDown }
  }

  const performance = getPerformanceStatus()
  const PerformanceIcon = performance.icon

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Performance Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Executive Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className={`h-8 w-8 ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <p className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${metrics.totalPnL.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{metrics.winRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{metrics.profitFactor.toFixed(2)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profit Factor</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <PerformanceIcon className={`h-8 w-8 text-${performance.color === 'success' ? 'green' : performance.color === 'warning' ? 'yellow' : 'red'}-600`} />
              </div>
              <p className={`text-2xl font-bold text-${performance.color === 'success' ? 'green' : performance.color === 'warning' ? 'yellow' : 'red'}-600`}>
                {metrics.totalReturn.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Return</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Insights</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Badge variant={performance.color} size="sm">{performance.status.toUpperCase()}</Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  Strategy performance is {performance.status} with {metrics.totalReturn.toFixed(1)}% total return
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={metrics.sharpeRatio > 1 ? 'success' : 'warning'} size="sm">
                  SHARPE: {metrics.sharpeRatio.toFixed(2)}
                </Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  Risk-adjusted returns are {metrics.sharpeRatio > 1 ? 'strong' : 'moderate'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={metrics.maxDrawdown < 15 ? 'success' : 'warning'} size="sm">
                  DD: {metrics.maxDrawdown.toFixed(1)}%
                </Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  Maximum drawdown is {metrics.maxDrawdown < 15 ? 'acceptable' : 'concerning'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {dataQuality && dataQuality.dataIntegrityScore > 90 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span>Data Quality</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataQuality ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  dataQuality.dataIntegrityScore > 90 ? 'text-green-600' : 
                  dataQuality.dataIntegrityScore > 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dataQuality.dataIntegrityScore}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data Integrity Score</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Records:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{dataQuality.totalRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valid Records:</span>
                  <span className="font-medium text-green-600">{dataQuality.validRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duplicates:</span>
                  <span className={`font-medium ${dataQuality.duplicates > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {dataQuality.duplicates}
                  </span>
                </div>
              </div>
              
              {Object.keys(dataQuality.missingValues).some(key => dataQuality.missingValues[key] > 0) && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Missing Values</h5>
                  <div className="space-y-1 text-xs">
                    {Object.entries(dataQuality.missingValues)
                      .filter(([_, count]) => count > 0)
                      .map(([field, count]) => (
                        <div key={field} className="flex justify-between">
                          <span className="text-yellow-700 dark:text-yellow-300">{field}:</span>
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {new Date(dataQuality.lastUpdated).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No data quality metrics available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}