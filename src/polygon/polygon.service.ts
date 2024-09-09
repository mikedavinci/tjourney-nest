// polygon.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class PolygonService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.polygon.io';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    this.apiKey = this.configService.get<string>('POLYGON_API_KEY');
  }
  getTickers(ticker: string): Observable<any> {
    const url = `${this.baseUrl}/v3/reference/tickers`;
    const params = {
      ticker,
      apiKey: this.apiKey,
    };
    // console.log(params);
    // console.log the response data
    return this.httpService.get(url, { params }).pipe(
      tap((response) => console.log('Response data:', response.data)),
      map((response) => response.data)
    );
  }
  getForexSnapshot(ticker: string): Observable<any> {
    const url = `${this.baseUrl}/v2/snapshot/locale/global/markets/forex/tickers/${ticker}`;
    // const url2 = `${this.baseUrl}/v2/snapshot/locale/global/markets/crypto/tickers/${ticker}`;

    // i need to try url2 if url1 returns an error or StatusCode 500

    const params = {
      apiKey: this.apiKey,
    };
    return this.httpService.get(url, { params }).pipe(
      tap((response) => console.log('Forex Snapshot Response:', response.data)),
      map((response) => response.data)
    );
  }

  getCryptoSnapshot(ticker: string): Observable<any> {
    const url = `${this.baseUrl}/v2/snapshot/locale/global/markets/crypto/tickers/${ticker}`;

    const params = {
      apiKey: this.apiKey,
    };
    return this.httpService.get(url, { params }).pipe(
      tap((response) =>
        console.log('Crypto Snapshot Response:', response.data)
      ),
      map((response) => response.data)
    );
  }

  async getAggregates(
    ticker: string,
    multiplier: string,
    timespan: string,
    from: string,
    to: string
  ): Promise<Observable<any>> {
    const url = `${this.baseUrl}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`;
    const params = {
      adjusted: 'true',
      sort: 'asc',
      limit: '500',
      apiKey: this.apiKey,
    };
    return this.httpService.get(url, { params }).pipe(
      tap((response) => console.log('Aggregate Response:', response.data)),
      map((response) => response.data)
    );
  }
}
