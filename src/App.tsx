import React from 'react';
import { Header } from './components/dashboard/Header';
import { MetricsGrid } from './components/dashboard/MetricsGrid';
import { PerformanceChart } from './components/charts/PerformanceChart';
import { PnLDistribution } from './components/charts/PnLDistribution';
import { TradeTable } from './components/dashboard/TradeTable';
import { ConfigurationPanel } from './components/dashboard/ConfigurationPanel';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { useBacktestData } from './hooks/useBacktestData';
import { AlertCircle, TrendingUp } from 'lucide-react';

function App() {
  const { 
    backtestResults, 
    tradeSignals, 
    configurations, 
    loading, 
    error, 
    refreshData 
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
      <Header onRefresh={refreshData} loading={loading} />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Metrics Overview */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Performance Metrics
          </h2>
          <MetricsGrid data={backtestResults} />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={backtestResults} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>P&L Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PnLDistribution data={backtestResults} />
            </CardContent>
          </Card>
        </section>

        {/* Trade History */}
        <section>
          <TradeTable data={backtestResults} />
        </section>

        {/* Configuration Panel */}
        <section>
          <ConfigurationPanel 
            configurations={configurations} 
            onRefresh={refreshData}
          />
        </section>
      </main>
    </div>
  );
}

export default App;