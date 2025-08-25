import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface BacktestResult {
  id: number
  trade_id: number | null
  symbol: string | null
  side: string | null
  entry_time: string | null
  exit_time: string | null
  entry_price: number | null
  exit_price: number | null
  pnl: number | null
  equity_after_trade: number | null
  tp_multiplier: number | null
  exit_reason: string | null
  created_at: string | null
}

export interface TradeSignal {
  id: number
  timestamp: string
  symbol: string
  side: string
  entry_price: number
  stop_loss: number
  take_profit: number
}

export interface Configuration {
  symbol: string
  is_active: boolean
  risk_per_trade_percent: number
  atr_min: number
  atr_max: number
  notes: string | null
  status: string
  cooldown_until: string | null
}

export function useBacktestData() {
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [tradeSignals, setTradeSignals] = useState<TradeSignal[]>([])
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBacktestResults = async () => {
    try {
      const { data, error } = await supabase
        .from('backtest_results')
        .select('*')
        .order('ClosedAt', { ascending: false })
        .limit(1000)

      if (error) throw error
      setBacktestResults(data || [])
    } catch (err) {
      console.error('Error fetching backtest results:', err)
      setError('Failed to fetch backtest results')
    }
  }

 const fetchTradeSignals = async () => {
   try {
     const { data, error } = await supabase
       .from('ai_trade_log')
       .select('*')
       .order('Timestamp', { ascending: false })
       .limit(500)

     if (error) throw error
     setTradeSignals(data || [])
   } catch (err) {
     console.error('Error fetching trade signals:', err)
     setError('Failed to fetch trade signals')
   }
 }

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .order('symbol', { ascending: true })

      if (error) throw error
      // Remove duplicates based on symbol
      const uniqueConfigs = (data || []).reduce((acc, config) => {
        const existing = acc.find(c => c.symbol === config.symbol)
        if (!existing) {
          acc.push(config)
        }
        return acc
      }, [] as Configuration[])
      setConfigurations(uniqueConfigs)
    } catch (err) {
      console.error('Error fetching configurations:', err)
      setError('Failed to fetch configurations')
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        fetchBacktestResults(),
        fetchTradeSignals(),
        fetchConfigurations()
      ])
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Failed to refresh data')
    }
    
    setLoading(false)
  }

  const refreshConfigurations = async () => {
    try {
      await fetchConfigurations()
    } catch (err) {
      console.error('Error refreshing configurations:', err)
      setError('Failed to refresh configurations')
    }
  }
  useEffect(() => {
    refreshData()
  }, [])

  return {
    backtestResults,
    tradeSignals,
    configurations,
    loading,
    error,
    refreshData,
    refreshConfigurations
  }
}