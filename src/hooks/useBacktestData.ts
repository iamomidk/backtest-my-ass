import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DataProcessor } from '../utils/dataProcessor'
import { MetricsCalculator } from '../utils/metricsCalculator'
import { TradeSignal, BacktestResult, NormalizedTrade, DataQualityMetrics, DashboardMetrics } from '../types/database'

export { TradeSignal, BacktestResult, NormalizedTrade, DataQualityMetrics, DashboardMetrics } from '../types/database'

export function useBacktestData() {
  const [normalizedTrades, setNormalizedTrades] = useState<NormalizedTrade[]>([])
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [dataQuality, setDataQuality] = useState<DataQualityMetrics | null>(null)
  const [tradeSignals, setTradeSignals] = useState<TradeSignal[]>([])
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const dataProcessor = DataProcessor.getInstance()

  const fetchAndProcessData = async () => {
    try {
      // Fetch backtest results
      const { data: backtestData, error: backtestError } = await supabase
        .from('backtest_results')
        .select('*')
        .order('ClosedAt', { ascending: false, nullsLast: true })
        .limit(1000)

      if (backtestError) throw backtestError
      setBacktestResults(backtestData || [])

      // Fetch trade signals
      const { data: signalsData, error: signalsError } = await supabase
       .from('ai_trade_log')
       .select('*')
       .order('Timestamp', { ascending: false })
       .limit(500)

      if (signalsError) throw signalsError
      setTradeSignals(signalsData || [])

      // Process and normalize data
      const normalized = dataProcessor.normalizeTradeData(signalsData || [], backtestData || [])
      setNormalizedTrades(normalized)

      // Calculate metrics
      const metrics = MetricsCalculator.calculateDashboardMetrics(normalized)
      setDashboardMetrics(metrics)

      // Calculate data quality
      const quality = dataProcessor.calculateDataQuality(normalized)
      setDataQuality(quality)

    } catch (err) {
      console.error('Error processing data:', err)
      setError('Failed to process data')
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await fetchAndProcessData()
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Failed to refresh data')
    }
    
    setLoading(false)
  }

  const runBacktest = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/backtest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) throw new Error('Backtest failed')
      
      const result = await response.json()
      console.log('Backtest completed:', result)
      
      await refreshData()
    } catch (err) {
      console.error('Backtest error:', err)
      setError('Failed to run backtest')
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [])

  return {
    normalizedTrades,
    dashboardMetrics,
    dataQuality,
    tradeSignals,
    backtestResults,
    loading,
    error,
    refreshData,
    runBacktest
  }
}