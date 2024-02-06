export interface CoinGeckoSimpleParams {
  ids: string;
  vs_currencies: string;
  include_market_cap?: boolean;
  include_24hr_vol?: boolean;
  include_24hr_change?: boolean;
  include_last_updated_at?: boolean;
  precision?: string;
}

export interface CoinGeckoListingsParams {
  vs_currency: string;
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
}

export interface CoinGeckoCategoriesParams {
  order: string;
}

export interface CoinGeckoMarketChartDataParams {
  id: string;
  vs_currency: string;
  days: string;
  interval?: string;
}

export interface CoinGeckoSingleCoinDataParams {
  id: string;
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
}

export interface CoinGeckoTopGainersLosersParams {
  vs_currency: string;
  duration?: string;
  top_coins?: string;
}

export interface CoinGeckoMarketCapChart {
  days: string;
  vs_currency?: string;
}

export interface CoinGeckoNFTsListParams {
  order?: string;
  asset_platform_id?: string;
  per_page?: number;
  page?: number;
}

export interface CoinGeckoNFTMarketDataParams {
  asset_platform_id?: string;
  order?: string;
  per_page?: number;
  page?: number;
}

export interface CoinGeckoNFTMarketChartParams {
  days: string;
}

export interface CoinGeckoNFTMarketChartByContractAddressParams {
  days: string;
}
