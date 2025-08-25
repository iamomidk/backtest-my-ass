# Cryptocurrency Backtesting and Optimization System

A comprehensive, production-ready cryptocurrency backtesting system that automates trading signal analysis, sophisticated risk management, and multi-scenario optimization.

## Features

- **Advanced Risk Management**: Multi-stage exit strategy with partial take-profits and trailing stops
- **Technical Analysis**: 200-period EMA trend filtering and volume spike detection
- **Database Integration**: PostgreSQL for signal retrieval and results storage
- **Market Data**: KuCoin API integration with intelligent caching
- **Optimization Engine**: Multi-scenario analysis across different take-profit multipliers
- **Production Ready**: Comprehensive error handling, logging, and professional code structure

## Requirements

- Python 3.8+
- PostgreSQL database
- Required Python packages (see requirements.txt)

## Database Schema

The system expects these PostgreSQL tables:

### ai_trade_log
```sql
CREATE TABLE ai_trade_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    symbol VARCHAR(20),
    side VARCHAR(10),
    entry_price NUMERIC(20, 8),
    stop_loss NUMERIC(20, 8),
    take_profit NUMERIC(20, 8)
);
```

### klines_{symbol}_1m
```sql
CREATE TABLE klines_btcusdt_1m (
    timestamp TIMESTAMP PRIMARY KEY,
    open NUMERIC(20, 8),
    high NUMERIC(20, 8),
    low NUMERIC(20, 8),
    close NUMERIC(20, 8),
    volume NUMERIC(20, 8)
);
```

### backtest_results (auto-created)
Results are automatically stored in this table with comprehensive trade metadata.

## Configuration

1. Copy `.env.example` to `.env` and configure your database settings:
```bash
cp .env.example .env
```

2. Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_trading
DB_USER=postgres
DB_PASSWORD=your_password
```

3. Customize trading parameters in `config.py`:
```python
initial_equity = 1000  # USD
risk_per_trade_pct = 1.0  # Risk per trade
max_concurrent_trades = 10
tp_multipliers_to_test = [2.0, 2.5, 3.0]
```

## Installation and Usage

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the backtesting system:
```bash
python main.py
```

## System Architecture

### Entry Filter System
All signals must pass these filters:
- **Trend Filter**: Long positions require price > 4H 200 EMA, shorts require price < 4H 200 EMA
- **Volume Filter**: Entry candle volume must exceed 20-period average × volume spike factor
- **Portfolio Filter**: Must not exceed maximum concurrent positions

### Risk Management
- **Position Sizing**: Based on (equity × risk%) / price_risk
- **Partial TP**: Close 50% at 1:1 risk/reward, move SL to breakeven
- **Trailing Stop**: Activated after partial TP
- **Final TP**: Exit remaining position at target multiplier

### Optimization Process
The system tests multiple take-profit multipliers and identifies the best performer based on profit factor, then saves those results to the database.

## Output

The system provides:
- Detailed optimization results table
- Comprehensive trade statistics
- Filter rejection analysis
- Database storage confirmation
- Complete logging for debugging

## Professional Features

- **Modular Architecture**: Clean separation of concerns across multiple files
- **Error Handling**: Graceful handling of database and API errors
- **Logging**: Comprehensive logging with file and console output
- **Caching**: Intelligent market data caching to minimize API calls
- **Performance**: Vectorized operations and efficient data processing
- **Documentation**: Complete docstrings and code comments

## Example Output

```
================================================================================
TAKE-PROFIT MULTIPLIER OPTIMIZATION RESULTS
================================================================================
TP Multiplier Total P&L    Win Rate %   Profit Factor   Max DD %     Total Trades
--------------------------------------------------------------------------------
2.0          45.67        65.2         1.85            12.3         23          
2.5          67.89        58.7         2.12            15.7         23          
3.0          52.34        52.2         1.67            18.9         23          
--------------------------------------------------------------------------------

Best performing TP multiplier: 2.5
Total P&L: $67.89
Win Rate: 58.7%
Profit Factor: 2.12
Max Drawdown: 15.7%
Total Trades: 23

Successfully saved 23 trades from the best run (TP Multiplier: 2.5) to the database.
```

## Support

This system is designed for professional cryptocurrency trading analysis. All components are production-ready with proper error handling and comprehensive logging for debugging and maintenance.