export const BASE_URL = 'api.coinbase.com';
export const API_PREFIX = '/api/v3/brokerage';
export const ALGORITHM = 'ES256';
export const VERSION = '0.1.0';
export const USER_AGENT = `coinbase-advanced-ts/${VERSION}`;
export const JWT_ISSUER = 'cdp';

export const TRADING_CONFIG = {
  BTC: {
    PRODUCT_ID: 'BTC-USD',
    MIN_SIZE: 0.0001,
    PRICE_PRECISION: 2,
  },
  ETH: {
    PRODUCT_ID: 'ETH-USD',
    MIN_SIZE: 0.001,
    PRICE_PRECISION: 2,
  },
};