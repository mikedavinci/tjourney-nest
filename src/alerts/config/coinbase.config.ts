// src/alerts/config/coinbase.config.ts

export const COINBASE_CONFIG = {
  // API Configuration
  API_KEY: process.env.COINBASE_API_KEY,
  API_SECRET: process.env.COINBASE_API_SECRET,

  // Trading Parameters
  FUTURES: {
    BTC: {
      PRODUCT_ID: 'BTC-USD',
      BASE_POSITION_SIZE: 0.01, // Base position size in BTC
      MAX_LEVERAGE: 10, // Maximum leverage to use
      DEFAULT_LEVERAGE: 5, // Default leverage if not specified
      STOP_LOSS_PERCENT: 1, // Stop loss percentage
      TAKE_PROFIT_PERCENT: 2, // Take profit percentage
      MIN_VOLUME_24H: 1000000, // Minimum 24h volume to trade
    },
    ETH: {
      PRODUCT_ID: 'ETH-USD',
      BASE_POSITION_SIZE: 0.1, // Base position size in ETH
      MAX_LEVERAGE: 10,
      DEFAULT_LEVERAGE: 5,
      STOP_LOSS_PERCENT: 1,
      TAKE_PROFIT_PERCENT: 2,
      MIN_VOLUME_24H: 500000,
    },
  },

  // Risk Management
  RISK_MANAGEMENT: {
    MAX_DAILY_LOSS_PERCENT: 3, // Maximum daily loss as percentage of account
    MAX_POSITION_SIZE_PERCENT: 20, // Maximum position size as percentage of account
    MAX_OPEN_POSITIONS: 2, // Maximum number of open positions
    MIN_ACCOUNT_BALANCE: 1000, // Minimum account balance to trade
  },

  // Trading Rules
  TRADING_RULES: {
    ENABLE_TRADING: true, // Global switch to enable/disable trading
    CHECK_INTERVAL: 5 * 60 * 1000, // Check interval in milliseconds (5 minutes)
    MIN_SPREAD_PERCENT: 0.1, // Minimum spread percentage to trade
    MAX_SLIPPAGE_PERCENT: 0.5, // Maximum allowed slippage percentage
  },
};
