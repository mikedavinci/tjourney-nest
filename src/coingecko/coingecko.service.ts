// coingecko.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
import {
  ILike,
  In,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  CoinGeckoSearchDto,
  CoinGeckoSearchResponseDto,
} from './dto/create-coingecko.dto';
import { CoinGeckoSearch } from './entities/coingecko.entity';
import { CoinOHLC } from './entities/coin-ohlc.entity';
import { SimplePrice } from './entities/simple-price.entity';
import { update } from 'lodash';
@Injectable()
export class CoinGeckoService {
  constructor(
    @InjectRepository(CoinGeckoSearch)
    private coinSearchRepository: Repository<CoinGeckoSearch>,
    @InjectRepository(CoinOHLC)
    private coinOHLCRepository: Repository<CoinOHLC>,
    @InjectRepository(SimplePrice)
    private simplePriceRepository: Repository<SimplePrice>
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
  // http://localhost:8001/api/cg/simple/price?ids=Bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&precision=2

  async getSimplePrice(params: CoinGeckoSimpleParams): Promise<any> {
    try {
      // Ensure ids is a comma-separated string
      const ids = Array.isArray(params.ids) ? params.ids.join(',') : params.ids;
      const vs_currency = 'usd';
      const coinIds = ids.split(',');

      // Check cache for quotes
      const cacheTime = 1 * 60 * 1000; // 15 minutes
      const validCacheDate = new Date(new Date().getTime() - cacheTime);
      // Check if the data is cached
      const cachedData = await this.simplePriceRepository.find({
        where: {
          coinId: In(coinIds),
          vs_currency,
          updatedAt: MoreThanOrEqual(validCacheDate),
        },
        order: {
          updatedAt: 'DESC',
        },
      });

      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute

      const coinsToFetch = coinIds.filter(
        (coinId) =>
          !cachedData.find(
            (data) =>
              data.coinId === coinId && new Date(data.updatedAt) >= oneMinuteAgo
          )
      );

      let result: Record<string, any> = {};

      if (coinsToFetch.length > 0) {
        console.log('Fetching coins:', coinsToFetch);
        const response = await this.fetchCoinGeckoData(coinsToFetch);
        console.log('response simple', response);
        await this.saveSimplePrice(response, vs_currency);
        result = { ...result, ...response };
      }

      // Add cached data for coins that didn't need updating
      cachedData.forEach((cachedCoin) => {
        if (!coinsToFetch.includes(cachedCoin.coinId)) {
          result[cachedCoin.coinId] = this.formatSingleCachedData(cachedCoin);
        }
      });

      // Ensure all requested coins are in the result
      coinIds.forEach((coinId) => {
        if (!result[coinId]) {
          result[coinId] = null;
        }
      });

      console.log('result', result);
      return result;
    } catch (error) {
      console.log('Failed to fetch simple price from CoinGecko', error);
      throw new HttpException(
        'Failed to fetch simple price from CoinGecko',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async fetchCoinGeckoData(
    coinIds: string[]
  ): Promise<Record<string, any>> {
    const response = await axios.get(`${this.baseUrl}/simple/price`, {
      headers: this.cgApiHeaders,
      params: {
        ids: coinIds.join(','),
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_vol: true,
        include_24hr_change: true,
        include_last_updated_at: true,
        precision: '8',
      },
    });
    return response.data;
  }

  private createPlaceholderData(): Record<string, any> {
    return {
      usd: null,
      usd_market_cap: null,
      usd_24h_vol: null,
      usd_24h_change: null,
      last_updated_at: null,
    };
  }

  // async getSimplePricedd(params: CoinGeckoSimpleParams): Promise<any> {
  //   try {
  //     console.log('params', params);
  //     const response = await axios.get(`${this.baseUrl}/simple/price`, {
  //       headers: this.cgApiHeaders,
  //       params: {
  //         ids: params.ids,
  //         vs_currencies: 'usd',
  //         include_market_cap: true,
  //         include_24hr_vol: true,
  //         include_24hr_change: true,
  //         include_last_updated_at: true,
  //         precision: '2',
  //       },
  //     });

  //     const parseResponse = response.data;
  //     console.log('parseResponse', parseResponse);
  //     return parseResponse;
  //   } catch (error) {
  //     // console.log(error);
  //     throw new HttpException(
  //       'Failed to fetch simple price from CoinGecko',
  //       error.response?.status || 500
  //     );
  //   }
  // }

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
        error.response?.status || 500
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
        error.response?.status || 500
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
        error.response?.status || 500
      );
    }
  }

  async getCoinDataReduced(
    id: string,
    query: CoinGeckoCoinsByIdParams
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
        error.response?.status || 500
      );
    }
  }
  async getCoinOHLC(id: string, query: CoinGeckoCoinOHLCParams): Promise<any> {
    try {
      // Check cache for quotes
      const cacheTime = 15 * 60 * 1000; // 15 minute
      const validCacheDate = new Date(new Date().getTime() - cacheTime);

      // Check if the coin OHLC data is cached
      const cachedData = await this.coinOHLCRepository.findOne({
        where: {
          coinId: id,
          updatedAt: MoreThan(validCacheDate),
        },
        order: {
          updatedAt: 'DESC',
        },
      });

      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      // If data is cached and fresh, return it
      if (cachedData && cachedData.updatedAt > fifteenMinutesAgo) {
        return cachedData.ohlcData;
      }

      const response = await axios.get(`${this.baseUrl}/coins/${id}/ohlc`, {
        headers: this.cgApiHeaders,
        params: {
          vs_currency: 'usd',
          days: '180',
          interval: 'daily',
          precision: '2',
        },
      });
      const ohlcData: number[][] = response.data;

      // Save or update the data in the database
      await this.saveCoinOHLC(id, ohlcData);

      return ohlcData;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch coin OHLC from CoinGecko',
        error.response?.status || 500
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
        }
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch categories list from CoinGecko',
        error.response?.status || 500
      );
    }
  }

  async getCategoriesWithMarketData(
    params: CoinGeckoCategoriesParams
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
        error.response?.status || 500
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
        error.response?.status || 500
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
        error.response?.status || 500
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
        error.response?.status || 500
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
        error.response?.status || 500
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
        error.response?.status || 500
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
        error.response?.status || 500
      );
    }
  }

  async getGlobalDeFi(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseDemoUrl}/global/decentralized_finance_defi`,
        {
          headers: this.cgdApiHeaders,
        }
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch global DeFi from CoinGecko',
        error.response?.status || 500
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
        error.response?.status || 500
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
              error
            );
            return null; // Return null or some error indicator for this coin
          });
        },
        { concurrency: 5 }
      ); // Set a reasonable concurrency limit to avoid API rate limits

      return coinDetails.filter((detail: any) => detail !== null); // Optionally, filter out failed requests
    } catch (error) {
      throw new HttpException(
        'Failed to fetch newly added coin details',
        error.response?.status || 500
      );
    }
  }

  async getTopGainersLosers(
    params: CoinGeckoTopGainersLosersParams
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/top_gainers_losers`,
        {
          headers: this.cgApiHeaders,
          params,
        }
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch top gainers and losers from CoinGecko',
        error.response?.status || 500
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
        }
      );
      return response.data;
    } catch (error) {
      // console.log(error);
      throw new HttpException(
        'Failed to fetch global market cap chart from CoinGecko',
        error.response?.status || 500
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
        error.response?.status || 500
      );
    }
  }

  async getNFTMarketChart(
    id: string,
    query: CoinGeckoNFTMarketChartParams
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/nfts/${id}/market_chart`,
        {
          headers: this.cgApiHeaders,
          params: query,
        }
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch NFT market chart from CoinGecko',
        error.response?.status || 500
      );
    }
  }

  async getNFTMarketChartByContractAddress(
    asset_platform_id,
    contract_address,
    query: CoinGeckoNFTMarketChartByContractAddressParams
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/nfts/${asset_platform_id}/contract/${contract_address}/market_chart`,
        {
          headers: this.cgApiHeaders,
          params: query,
        }
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch NFT market chart by contract address from CoinGecko',
        error.response?.status || 500
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
        error.response?.status || 500
      );
    }
  }

  async getExchangeVolumeInBTC(
    id: string,
    from: number,
    to: number
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
        }
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch exchange volume in BTC from CoinGecko',
        error.response?.status || 500
      );
    }
  }

  async searchQuery(query: string): Promise<any> {
    try {
      // Check if we have cached results
      const cachedResults = await this.coinSearchRepository.find({
        where: [
          { name: ILike(`${query}`) },
          { symbol: ILike(`${query}`) },
          { coinId: ILike(`${query}`) },
          // { name: ILike(`${query}%`), marketCapRank: LessThan(100) },
          // { symbol: ILike(`${query}%`), marketCapRank: LessThan(100) },
          // { coinId: ILike(`${query}%`), marketCapRank: LessThan(100) }
        ],
        take: 10,
        order: {
          marketCapRank: 'ASC',
          name: 'ASC',
        },
      });

      if (cachedResults.length > 0) {
        return this.formatCachedResults(cachedResults);
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: this.cgApiHeaders,
        params: {
          query,
        },
      });
      // console.log(response.data);
      // Cache the results
      await this.cacheResults(response.data.coins);

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch search query from CoinGecko',
        error.response?.status || 500
      );
    }
  }

  private async saveCoinOHLC(
    coinId: string,
    ohlcData: number[][]
  ): Promise<void> {
    const existingData = await this.coinOHLCRepository.findOne({
      where: { coinId },
    });

    if (existingData) {
      existingData.ohlcData = ohlcData;
      existingData.updatedAt = new Date();
      await this.coinOHLCRepository.save(existingData);
    } else {
      const newCoinOHLC = this.coinOHLCRepository.create({
        coinId,
        ohlcData,
        updatedAt: new Date(),
      });
      await this.coinOHLCRepository.save(newCoinOHLC);
    }
  }

  private isCacheValid(updatedAt: Date): boolean {
    const cacheTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    return new Date().getTime() - updatedAt.getTime() < cacheTime;
  }

  private async cacheResults(
    coins: CoinGeckoSearchResponseDto[]
  ): Promise<void> {
    const existingCoins = await this.coinSearchRepository.find({
      where: { coinId: In(coins.map((coin) => coin.id)) },
    });

    const coinsToUpdate = existingCoins.map((existing) => {
      const newData = coins.find((coin) => coin.id === existing.coinId);
      return {
        ...existing,
        name: newData.name,
        apiSymbol: newData.api_symbol,
        symbol: newData.symbol,
        marketCapRank: newData.market_cap_rank,
        thumb: newData.thumb,
        large: newData.large,
        updatedDate: new Date(),
      };
    });

    const coinsToCreate = coins
      .filter(
        (coin) => !existingCoins.some((existing) => existing.coinId === coin.id)
      )
      .map((coin) => ({
        coinId: coin.id,
        name: coin.name,
        apiSymbol: coin.api_symbol,
        symbol: coin.symbol,
        marketCapRank: coin.market_cap_rank,
        thumb: coin.thumb,
        large: coin.large,
      }));

    if (coinsToUpdate.length > 0) {
      await this.coinSearchRepository.save(coinsToUpdate);
    }

    if (coinsToCreate.length > 0) {
      await this.coinSearchRepository.insert(coinsToCreate);
    }
  }

  private async saveSimplePrice(data: any, vs_currency: string): Promise<void> {
    const simplePriceDataArray = Object.entries(data).map(
      ([coinId, coinData]: [string, any]) => ({
        coinId,
        vs_currency,
        price: coinData[vs_currency],
        market_cap: coinData[`${vs_currency}_market_cap`] || null,
        vol_24h: coinData[`${vs_currency}_24h_vol`] || null,
        change_24h: coinData[`${vs_currency}_24h_change`] || null,
        last_updated_at: coinData['last_updated_at'] || null,
        updatedAt: new Date(),
      })
    );

    await this.simplePriceRepository.upsert(simplePriceDataArray, [
      'coinId',
      'vs_currency',
    ]);
  }
  private formatCachedData(cachedData: SimplePrice[]): any {
    const formattedData = {};
    for (const data of cachedData) {
      formattedData[data.coinId] = this.formatSingleCachedData(data);
    }
    return formattedData;
  }

  private formatSingleCachedData(data: SimplePrice): any {
    console.log('Formatting single cached data:', data);
    // Formatting single cached data: SimplePrice {
    //   id: 'daf60d73-e083-4d2e-a77f-403401fc6ff4',
    //   coinId: 'energy-web-token',
    //   vs_currency: 'usd',
    //   price: '1.4785068',
    //   market_cap: '77768438.5151368',
    //   vol_24h: '969036.0855007546',
    //   change_24h: '-5.082818351651243',
    //   last_updated_at: 1725251177,
    //   createdAt: 2024-08-13T05:17:05.858Z,
    //   updatedAt: 2024-09-02T04:26:22.660Z }

    return {
      // id, coinId,
      [`coinId`]: data.coinId,
      [data.vs_currency]: data.price,
      [`${data.vs_currency}_market_cap`]: data.market_cap,
      [`${data.vs_currency}_24h_vol`]: data.vol_24h,
      [`${data.vs_currency}_24h_change`]: data.change_24h,
      last_updated_at: data.last_updated_at,
    };
  }

  private formatCachedResults(
    cachedResults: CoinGeckoSearch[]
  ): CoinGeckoSearchDto {
    return {
      coins: cachedResults.map((result) => ({
        id: result.coinId,
        name: result.name,
        api_symbol: result.apiSymbol,
        symbol: result.symbol,
        market_cap_rank: result.marketCapRank,
        thumb: result.thumb,
        large: result.large,
      })),
    };
  }
}
