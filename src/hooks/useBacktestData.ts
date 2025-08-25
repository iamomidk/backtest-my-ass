import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface BacktestResult {
  SignalID?: string
  Symbol?: string
  Action?: string
  Entry?: number
  StopLoss?: number
  TakeProfit?: number
  Leverage?: number
  Outcome?: string
  ClosedAt?: string
  'P&L ($)'?: number
  'Risk/Reward'?: number
  'Ending Equity'?: number
  // Normalized fields for easier access
  id?: string
  symbol?: string
  side?: string
  entry_time?: string
  exit_time?: string
  entry_price?: number
  exit_price?: number
  pnl?: number
  equity_after_trade?: number
  tp_multiplier?: number
  exit_reason?: string
  created_at?: string
}

export interface TradeSignal {
  SignalID: string
  Timestamp: string
  Symbol: string
  Status: string
  Action: string
  Entry: number
  StopLoss: number
  TakeProfit: number
  AI_Rationale?: string
  ClosingPrice?: number
  ActivationTimestamp?: string
  Notes?: string
  Leverage?: number
  Outcome?: string
  ClosedAt?: string
  ConfidenceScore?: number
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
        .order('ClosedAt', { ascending: false, nullsLast: true })
        .limit(1000)

      if (error) throw error
      
      // Normalize the data for easier access
      const normalizedData = (data || []).map(item => ({
        ...item,
        id: item.SignalID,
        symbol: item.Symbol,
        side: item.Action?.toLowerCase(),
        entry_time: item.ActivationTimestamp || item.Timestamp,
        exit_time: item.ClosedAt,
        entry_price: item.Entry,
        exit_price: item.ClosingPrice,
        pnl: item['P&L ($)'],
        equity_after_trade: item['Ending Equity'],
        tp_multiplier: item['Risk/Reward'],
        exit_reason: item.Outcome?.toLowerCase(),
        created_at: item.ClosedAt
      }))
      
      setBacktestResults(normalizedData)
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
    refreshConfigurations,
    runBacktest
  }
}