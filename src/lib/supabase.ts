import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      ai_trade_log: {
        Row: {
          id: number
          timestamp: string
          symbol: string
          side: string
          entry_price: number
          stop_loss: number
          take_profit: number
        }
      }
      backtest_results: {
        Row: {
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
      }
      configurations: {
        Row: {
          symbol: string
          is_active: boolean
          risk_per_trade_percent: number
          atr_min: number
          atr_max: number
          notes: string | null
          status: string
          cooldown_until: string | null
        }
      }
    }
  }
}