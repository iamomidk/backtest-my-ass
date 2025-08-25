"""
Technical indicator calculations for the backtesting system.
"""

import pandas as pd
import numpy as np
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class TechnicalIndicators:
    """Calculate technical indicators for trading analysis."""
    
    @staticmethod
    def calculate_ema(data: pd.Series, period: int) -> pd.Series:
        """
        Calculate Exponential Moving Average (EMA).
        
        Args:
            data: Price series
            period: EMA period
        
        Returns:
            EMA series
        """
        return data.ewm(span=period, adjust=False).mean()
    
    @staticmethod
    def calculate_sma(data: pd.Series, period: int) -> pd.Series:
        """
        Calculate Simple Moving Average (SMA).
        
        Args:
            data: Price series
            period: SMA period
        
        Returns:
            SMA series
        """
        return data.rolling(window=period).mean()
    
    @staticmethod
    def calculate_volume_average(volume_data: pd.Series, period: int) -> pd.Series:
        """
        Calculate rolling volume average.
        
        Args:
            volume_data: Volume series
            period: Rolling period
        
        Returns:
            Volume average series
        """
        return volume_data.rolling(window=period).mean()
    
    @staticmethod
    def detect_volume_spike(current_volume: float, avg_volume: float, 
                          spike_factor: float) -> bool:
        """
        Detect if current volume represents a spike.
        
        Args:
            current_volume: Current candle volume
            avg_volume: Average volume
            spike_factor: Minimum factor for spike detection
        
        Returns:
            True if volume spike detected
        """
        if pd.isna(avg_volume) or avg_volume == 0:
            return False
        
        return current_volume > (avg_volume * spike_factor)
    
    @staticmethod
    def calculate_trend_direction(price: float, ema_value: float) -> str:
        """
        Determine trend direction based on price relative to EMA.
        
        Args:
            price: Current price
            ema_value: EMA value
        
        Returns:
            'bullish', 'bearish', or 'neutral'
        """
        if pd.isna(ema_value):
            return 'neutral'
        
        if price > ema_value:
            return 'bullish'
        elif price < ema_value:
            return 'bearish'
        else:
            return 'neutral'

class IndicatorCalculator:
    """Main class for calculating indicators on market data."""
    
    def __init__(self):
        """Initialize indicator calculator."""
        self.indicators = TechnicalIndicators()
    
    def add_indicators_to_dataframe(self, df: pd.DataFrame, 
                                  ema_period: int = 200,
                                  volume_period: int = 20) -> pd.DataFrame:
        """
        Add technical indicators to market data DataFrame.
        
        Args:
            df: Market data DataFrame with OHLCV columns
            ema_period: EMA period for trend analysis
            volume_period: Period for volume average calculation
        
        Returns:
            DataFrame with added indicator columns
        """
        df_with_indicators = df.copy()
        
        # Calculate 200 EMA on close prices
        df_with_indicators[f'ema_{ema_period}'] = self.indicators.calculate_ema(
            df['close'], ema_period
        )
        
        # Calculate volume average
        df_with_indicators[f'volume_avg_{volume_period}'] = self.indicators.calculate_volume_average(
            df['volume'], volume_period
        )
        
        # Add trend direction
        df_with_indicators['trend_direction'] = df_with_indicators.apply(
            lambda row: self.indicators.calculate_trend_direction(
                row['close'], row[f'ema_{ema_period}']
            ), axis=1
        )
        
        logger.info(f"Added indicators: EMA-{ema_period}, Volume Average-{volume_period}")
        return df_with_indicators
    
    def check_trend_filter(self, entry_price: float, ema_value: float, 
                          trade_side: str) -> bool:
        """
        Check if trade passes trend filter.
        
        Args:
            entry_price: Entry price for the trade
            ema_value: EMA value at entry time
            trade_side: 'long' or 'short'
        
        Returns:
            True if trend filter passes
        """
        if pd.isna(ema_value):
            return False
        
        if trade_side.lower() == 'long':
            return entry_price > ema_value
        elif trade_side.lower() == 'short':
            return entry_price < ema_value
        else:
            return False
    
    def check_volume_filter(self, current_volume: float, avg_volume: float,
                          spike_factor: float) -> bool:
        """
        Check if trade passes volume filter.
        
        Args:
            current_volume: Volume at entry candle
            avg_volume: Average volume
            spike_factor: Required volume spike factor
        
        Returns:
            True if volume filter passes
        """
        return self.indicators.detect_volume_spike(
            current_volume, avg_volume, spike_factor
        )