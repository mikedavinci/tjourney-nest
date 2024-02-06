import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import {
  CoinGeckoCategoriesParams,
  CoinGeckoMarketCapChart,
  CoinGeckoNFTMarketChartByContractAddressParams,
  CoinGeckoNFTMarketChartParams,
  CoinGeckoNFTMarketDataParams,
  CoinGeckoNFTsListParams,
  CoinGeckoSimpleParams,
  CoinGeckoTopGainersLosersParams,
} from './interface.coingecko';

@Injectable()
export class CoinGeckoService {
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
