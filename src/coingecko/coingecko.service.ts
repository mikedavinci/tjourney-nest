import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
export interface CoinGeckoListingsParams {
  vs_currency: string;
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
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
@Injectable()
export class CoinGeckoService {
  private readonly cgApiHeaders = {
    // eslint-disable-next-line prettier/prettier
    'x-cg-pro-api-key': process.env.COINGECKO_PRO_API_KEY,
    Accept: '*/*',
  };
  private readonly baseUrl = 'https://pro-api.coingecko.com/api/v3';

  async getCoinList(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/list`, {
        headers: this.cgApiHeaders,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch coin list from CoinGecko',
        error.response?.status || 500,
      );
    }
  }

  // async getMarketChartRange(
  //   params: CoinGeckoMarketChartDataParams,
  // ): Promise<any> {
  //   const url = `${this.baseUrl}/coins/${params.id}/market_chart/range`;
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(url, {
  //         params,
  //         headers: this.cgApiHeaders,
  //       }),
  //     );
  //     return response.data;
  //   } catch (error) {
  //     throw new HttpException(
  //       'Failed to fetch market chart data from CoinGecko',
  //       error.response?.status || 500,
  //     );
  //   }
  // }

  // async getSingleCoinData(params: CoinGeckoSingleCoinDataParams): Promise<any> {
  //   const url = `${this.baseUrl}/coins/${params.id}`;
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(url, { headers: this.cgApiHeaders, params }),
  //     );
  //     return response.data;
  //   } catch (error) {
  //     throw new HttpException(
  //       'Failed to fetch single coin data from CoinGecko',
  //       error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // Add more methods for other CoinGecko endpoints as needed
}
