import React from 'react';
import { Header } from './components/dashboard/Header';
import { ExecutiveSummary } from './components/dashboard/ExecutiveSummary';
import { PerformanceChart } from './components/charts/PerformanceChart';
import { PnLDistribution } from './components/charts/PnLDistribution';
import { EnhancedTradeTable } from './components/dashboard/EnhancedTradeTable';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { useBacktestData } from './hooks/useBacktestData';
import { AlertCircle, TrendingUp, BarChart3, Database } from 'lucide-react';

function App() {
  const { 
    normalizedTrades,
    dashboardMetrics,
    dataQuality,
    loading, 
    error, 
    refreshData,
    runBacktest
  } = useBacktestData();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex items-center space-x-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Connection Error</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onRefresh={refreshData} onRunBacktest={runBacktest} loading={loading} />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Executive Summary */}
        <section>
          <ExecutiveSummary 
            metrics={dashboardMetrics || {
              totalTrades: 0, winRate: 0, totalPnL: 0, finalEquity: 10000,
              maxDrawdown: 0, profitFactor: 0, sharpeRatio: 0, avgWin: 0,
              avgLoss: 0, largestWin: 0, largestLoss: 0, avgTradeDuration: 0, totalReturn: 0
            }} 
            dataQuality={dataQuality} 
          />
        </section>

        {/* Analytics Charts */}
        {normalizedTrades.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Performance Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart data={normalizedTrades} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>P&L Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <PnLDistribution data={normalizedTrades} />
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Trade History */}
        {normalizedTrades.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              Detailed Trade Analysis
            </h2>
            <EnhancedTradeTable data={normalizedTrades} />
          </section>
        )}

        {/* No Data State */}
        {!loading && normalizedTrades.length === 0 && (
          <section className="text-center py-12">
            <div className="max-w-md mx-auto">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Trading Data Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Run a backtest to generate trading data and performance analytics.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;