import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import {
  CoinGeckoCategoriesParams,
  CoinGeckoCoinOHLCParams,
  CoinGeckoCoinsByIdParams,
  CoinGeckoCoinsMarketsParams,
  CoinGeckoExchangesListParams,
  CoinGeckoMarketCapChart,
  CoinGeckoNFTMarketChartByContractAddressParams,
  CoinGeckoNFTMarketChartParams,
  CoinGeckoNFTMarketDataParams,
  CoinGeckoNFTsListParams,
  CoinGeckoSimpleParams,
  CoinGeckoTopGainersLosersParams,
} from './interface.coingecko';
import * as Promise from 'bluebird';
import { Token } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class CoinGeckoService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  private readonly cgApiHeaders = {
    // eslint-disable-next-line prettier/prettier
    'x-cg-pro-api-key': process.env.COINGECKO_PRO_API_KEY,
    Accept: '*/*',
  };

  private readonly cgdApiHeaders = {
    // eslint-disable-next-line prettier/prettier
     'x-cg-demo-api-key': process.env.COINGECKO_DEMO_API_KEY,
    Accept: '*/*',
  };

  private readonly baseUrl = 'https://pro-api.coingecko.com/api/v3';

  private readonly baseDemoUrl = 'https://api.coingecko.com/api/v3';

  // SIMPLE
  async getSimplePrice(params: CoinGeckoSimpleParams): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/simple/price`, {
        headers: this.cgdApiHeaders,
        params,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch simple price from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // COINS
  async getCoinList(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/coins/list`, {
        headers: this.cgdApiHeaders,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch coin list from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getCoinsMarkets(params: CoinGeckoCoinsMarketsParams): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/coins/markets`, {
        headers: this.cgdApiHeaders,
        params,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch coins markets from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getCoinData(id: string, query: CoinGeckoCoinsByIdParams): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/coins/${id}`, {
        headers: this.cgdApiHeaders,
        params: query,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch coin data from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getCoinDataReduced(
    id: string,
    query: CoinGeckoCoinsByIdParams,
  ): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/coins/${id}`, {
        headers: this.cgdApiHeaders,
        params: query,
      });
      const data = response.data;

      // Extract only the needed fields
      const reducedData = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        web_slug: data.web_slug,
        asset_platform_id: data.asset_platform_id ?? null,
        platforms: data.platforms ?? {},
        detail_platforms: data.detail_platforms ?? {},
        block_time_in_minutes: data.block_time_in_minutes ?? 0,
        hashing_algorithm: data.hashing_algorithm ?? null,
        categories: data.categories ?? [],
        preview_listing: data.preview_listing ?? false,
        public_notice: data.public_notice ?? null,
        additional_notices: data.additional_notices ?? [],
        localization: data.localization.en ?? {},
        description: data.description?.en ?? '',
        links: data.links ?? {},
        image: {
          thumb: data.image?.thumb ?? '',
          small: data.image?.small ?? '',
          large: data.image?.large ?? '',
        },
        country_origin: data.country_origin ?? null,
        genesis_date: data.genesis_date ?? null,
        sentiment_votes_up_percentage: data.sentiment_votes_up_percentage ?? 0,
        sentiment_votes_down_percentage:
          data.sentiment_votes_down_percentage ?? 0,
        watchlist_portfolio_users: data.watchlist_portfolio_users ?? 0,
        market_cap_rank: data.market_cap_rank ?? null,
        market_data: {
          current_price: data.market_data?.current_price?.usd ?? 0,
          // Continue for other market_data fields, applying optional chaining and default values
          ath: data.market_data?.ath?.usd ?? 0,
          // ...
          last_updated: data.market_data?.last_updated ?? 'N/A',
        },
        last_updated: data.last_updated ?? 'N/A',
        tickers:
          data.tickers?.map((ticker) => ({
            base: ticker.base ?? 'N/A',
            target: ticker.target ?? 'N/A',
            market: {
              name: ticker.market?.name ?? 'N/A',
              identifier: ticker.market?.identifier ?? 'N/A',
              has_trading_incentive:
                ticker.market?.has_trading_incentive ?? false,
            },
            last: ticker.last ?? 0,
            volume: ticker.volume ?? 0,
            converted_last: {
              btc: ticker.converted_last?.btc ?? 0,
              eth: ticker.converted_last?.eth ?? 0,
              usd: ticker.converted_last?.usd ?? 0,
            },
            converted_volume: {
              btc: ticker.converted_volume?.btc ?? 0,
              eth: ticker.converted_volume?.eth ?? 0,
              usd: ticker.converted_volume?.usd ?? 0,
            },
            trust_score: ticker.trust_score ?? 'N/A',
            bid_ask_spread_percentage: ticker.bid_ask_spread_percentage ?? 0,
            timestamp: ticker.timestamp ?? 'N/A',
            last_traded_at: ticker.last_traded_at ?? 'N/A',
            last_fetch_at: ticker.last_fetch_at ?? 'N/A',
            is_anomaly: ticker.is_anomaly ?? false,
            is_stale: ticker.is_stale ?? false,
            trade_url: ticker.trade_url ?? 'N/A',
            token_info_url: ticker.token_info_url ?? 'N/A',
            coin_id: ticker.coin_id ?? 'N/A',
            target_coin_id: ticker.target_coin_id ?? 'N/A',
          })) ?? [], // Use an empty array as default if tickers are not present
      };

      return reducedData;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch reduced coin data from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getCoinOHLC(id: string, query: CoinGeckoCoinOHLCParams): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/${id}/ohlc`, {
        headers: this.cgApiHeaders,
        params: query,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch coin OHLC from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // CONTRACT

  // ASSET PLATFORMS

  // CATEGORIES
  async getCategoriesList(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseDemoUrl}/coins/categories/list`,
        {
          headers: this.cgdApiHeaders,
        },
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch categories list from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getCategoriesWithMarketData(
    params: CoinGeckoCategoriesParams,
  ): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/coins/categories`, {
        headers: this.cgdApiHeaders,
        params,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch categories with market data from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // EXCHANGES
  async getExchangesList(query: CoinGeckoExchangesListParams): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/exchanges`, {
        headers: this.cgdApiHeaders,
        params: query,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch exchanges list from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // DERIVATES

  // NFTS
  async getNFTsList(params: CoinGeckoNFTsListParams): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/nfts/list`, {
        headers: this.cgdApiHeaders,
        params,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch NFTs list from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getNFTData(id: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/nfts/${id}`, {
        headers: this.cgdApiHeaders,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch NFT data from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // EXCHANGE_RATES

  // SEARCH
  async search(params: { query: string }): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/search`, {
        headers: this.cgdApiHeaders,
        params,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to search from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // TRENDING
  async getTrending(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/search/trending`, {
        headers: this.cgdApiHeaders,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch trending from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // GLOBAL
  async getGlobal(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseDemoUrl}/global`, {
        headers: this.cgdApiHeaders,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch global from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getGlobalDeFi(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseDemoUrl}/global/decentralized_finance_defi`,
        {
          headers: this.cgdApiHeaders,
        },
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch global DeFi from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // COMPANIES

  // PRO ENDPOINTS
  async getNewlyAddedCoins(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/list/new`, {
        headers: this.cgApiHeaders,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch newly added coins from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getNewlyAddedCoinDetails(): Promise<any[]> {
    try {
      const coins = await this.getNewlyAddedCoins(); // Fetch the list of newly added coins

      // Use Bluebird.map for parallel requests with error handling
      const coinDetails = await Promise.map(
        coins,
        (coin: any) => {
          return Promise.try(() => {
            return this.getCoinDataReduced(coin.id, {}); // Fetch coin details
          }).catch((error: any) => {
            // Handle individual coin fetch errors, e.g., log or return a default value
            console.error(
              `Failed to fetch details for coin ${coin.id}:`,
              error,
            );
            return null; // Return null or some error indicator for this coin
          });
        },
        { concurrency: 5 },
      ); // Set a reasonable concurrency limit to avoid API rate limits

      return coinDetails.filter((detail: any) => detail !== null); // Optionally, filter out failed requests
    } catch (error) {
      throw new HttpException(
        'Failed to fetch newly added coin details',
        error.response?.status || 500,
      );
    }
  }

  async getTopGainersLosers(
    params: CoinGeckoTopGainersLosersParams,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/top_gainers_losers`,
        {
          headers: this.cgApiHeaders,
          params,
        },
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch top gainers and losers from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getGlobalMarketCapChart(params: CoinGeckoMarketCapChart): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/global/market_cap_chart`,
        {
          headers: this.cgApiHeaders,
          params,
        },
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch global market cap chart from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getNFTMarketData(params: CoinGeckoNFTMarketDataParams): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/nfts/markets`, {
        headers: this.cgApiHeaders,
        params,
      });
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch NFT market data from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getNFTMarketChart(
    id: string,
    query: CoinGeckoNFTMarketChartParams,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/nfts/${id}/market_chart`,
        {
          headers: this.cgApiHeaders,
          params: query,
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch NFT market chart from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getNFTMarketChartByContractAddress(
    asset_platform_id,
    contract_address,
    query: CoinGeckoNFTMarketChartByContractAddressParams,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/nfts/${asset_platform_id}/contract/${contract_address}/market_chart`,
        {
          headers: this.cgApiHeaders,
          params: query,
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch NFT market chart by contract address from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getNFTTickers(id: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/nfts/${id}/tickers`, {
        headers: this.cgApiHeaders,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch NFT tickers from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  async getExchangeVolumeInBTC(
    id: string,
    from: number,
    to: number,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/exchanges/${id}/volume_chart/range`,
        {
          headers: this.cgApiHeaders,
          params: {
            from,
            to,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch exchange volume in BTC from CoinGecko',
        error.response?.status || 500,
      );
    }
  }
}
