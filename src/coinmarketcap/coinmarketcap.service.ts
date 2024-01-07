import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface LatestListingsParams {
  start: number;
  limit: number;
  sort: string;
  // cryptocurrencyType: string;
  // tag: string;
}
interface OhlcvHistoricalParams {
  symbol: string;
  time_start: string;
  time_end: string;
  count: number;
}

@Injectable()
export class CoinmarketcapService {
  private readonly cmApiHeaders = {
    'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY,
    Accept: '*/*',
  };
  private readonly baseUrl = 'https://pro-api.coinmarketcap.com';

  async getLatestGlobalMetrics(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/global-metrics/quotes/latest`,
        {
          headers: this.cmApiHeaders,
        },
      );
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch data from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCryptoInfo(ids: string[]): Promise<any> {
    try {
      const joinedIds = ids.join(',');
      const response = await axios.get(
        `${this.baseUrl}/v2/cryptocurrency/info?id=${joinedIds}`,
        {
          headers: this.cmApiHeaders,
        },
      );
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch cryptocurrency information from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLatestListings(params: LatestListingsParams): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/cryptocurrency/listings/latest`,
        {
          headers: this.cmApiHeaders,
          params,
        },
      );
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch the latest listings from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getOhlcvHistorical(params: OhlcvHistoricalParams): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/cryptocurrency/ohlcv/historical`,
        {
          headers: this.cmApiHeaders,
          params,
        },
      );
      return response.data;
    } catch (err) {
      console.log('err => ', err);
      throw new HttpException(
        'Failed to fetch the cryptocurrency ohlcv historical listings from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
