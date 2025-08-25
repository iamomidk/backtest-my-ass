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

export interface NormalizedTrade {
  id: string
  symbol: string
  side: 'long' | 'short'
  entry_time: string
  exit_time?: string
  entry_price: number
  exit_price?: number
  stop_loss: number
  take_profit: number
  pnl?: number
  equity_after_trade?: number
  tp_multiplier?: number
  exit_reason?: string
  leverage: number
  confidence_score?: number
  ai_rationale?: string
  status: 'open' | 'closed' | 'pending'
}

export interface DataQualityMetrics {
  totalRecords: number
  validRecords: number
  duplicates: number
  missingValues: {
    [key: string]: number
  }
  dataIntegrityScore: number
  lastUpdated: string
}

export interface DashboardMetrics {
  totalTrades: number
  winRate: number
  totalPnL: number
  finalEquity: number
  maxDrawdown: number
  profitFactor: number
  sharpeRatio: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  avgTradeDuration: number
  totalReturn: number
}