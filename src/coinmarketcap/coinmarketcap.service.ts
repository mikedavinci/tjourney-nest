import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CoinGeckoSearch } from 'src/coingecko/entities/coingecko.entity';
import { TwelveDataLogo } from 'src/twelvedata/entities/twelve-data-logo.entity';
import { In, Repository } from 'typeorm';

interface LatestListingsParams {
  start: number;
  limit: number;
  sort: string;
  // cryptocurrencyType: string;
  // tag: string;
}
interface OhlcvHistoricalParams {
  id: string;
  time_period?: string;
  time_start?: string;
  count?: number;
  interval?: string;
}

@Injectable()
export class CoinmarketcapService {
  constructor(
    @InjectRepository(CoinGeckoSearch)
    private coingeckoSearchRepository: Repository<CoinGeckoSearch>,
    @InjectRepository(TwelveDataLogo)
    private twelveDataLogoRepository: Repository<TwelveDataLogo>
  ) {}

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
        }
      );
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch data from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getLatestQuote(id: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/cryptocurrency/quotes/latest?id=${id}`,
        {
          headers: this.cmApiHeaders,
        }
      );
      // console.log('getLatestQuote SUCCEEDED', response.data);
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch data from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCryptoMap(symbol: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/cryptocurrency/map?symbol=${symbol}`,
        {
          headers: this.cmApiHeaders,
        }
      );
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch data from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCryptoInfo(id: string[]): Promise<any> {
    try {
      const joinedSlugs = id.join(',');
      const response = await axios.get(
        `${this.baseUrl}/v2/cryptocurrency/info?id=${joinedSlugs}`,
        {
          headers: this.cmApiHeaders,
        }
      );
      // console.log('getCryptoInfo SUCCEEDED', response.data);
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch cryptocurrency information from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCryptoInfoAlert(ids: string[], symbols: string[]): Promise<any> {
    const results = [];
    const failedSymbols = [];

    // Combine ids and symbols
    const allIdentifiers = [...ids, ...symbols];

    // Remove specific symbols from the list
    const filteredIdentifiers = allIdentifiers.filter(
      (identifier) => !['RNDR', 'MYTHUSDC_4620BE'].includes(identifier)
    );

    // Search in CoinGeckoSearch table
    const coinGeckoResults = await this.coingeckoSearchRepository.find({
      where: [
        { coinId: In(filteredIdentifiers) },
        { symbol: In(filteredIdentifiers.map((s) => s.toUpperCase())) },
      ],
      select: ['coinId', 'symbol', 'name', 'large', 'apiSymbol'],
    });

    // Process CoinGecko results
    for (const crypto of coinGeckoResults) {
      results.push({
        id: crypto.coinId,
        logo: crypto.large,
        symbol: crypto.symbol,
        name: crypto.name,
        description: null, // CoinGeckoSearch doesn't have a description field
      });
      // Remove from filteredIdentifiers
      const index = filteredIdentifiers.findIndex(
        (i) =>
          i.toUpperCase() === crypto.symbol.toUpperCase() || i === crypto.coinId
      );
      if (index > -1) {
        filteredIdentifiers.splice(index, 1);
      }
    }

    // Search remaining identifiers in TwelveDataLogo table
    if (filteredIdentifiers.length > 0) {
      const twelveDataResults = await this.twelveDataLogoRepository.find({
        where: { symbol: In(filteredIdentifiers.map((s) => s.toUpperCase())) },
        select: ['symbol', 'url', 'logoBase', 'logoQuote'],
      });

      // Process TwelveData results
      for (const crypto of twelveDataResults) {
        results.push({
          id: null, // TwelveDataLogo doesn't have an id field
          logo: crypto.url || crypto.logoBase || crypto.logoQuote,
          symbol: crypto.symbol,
          name: null, // TwelveDataLogo doesn't have a name field
          description: null,
        });
        // Remove from filteredIdentifiers
        const index = filteredIdentifiers.findIndex(
          (i) => i.toUpperCase() === crypto.symbol.toUpperCase()
        );
        if (index > -1) {
          filteredIdentifiers.splice(index, 1);
        }
      }
    }

    // Any remaining identifiers are considered failed
    failedSymbols.push(...filteredIdentifiers);

    // Log failed symbols
    if (failedSymbols.length > 0) {
      console.log('Failed symbols:', failedSymbols.join(','));
    } else {
      console.log('No failed symbols');
    }

    return {
      data: results,
      failedSymbols: failedSymbols,
    };
  }

  // async getCryptoInfoAlert(ids: string[], symbols: string[]): Promise<any> {
  //   const batchSize = 200; // CoinMarketCap API limit
  //   const results = [];
  //   const failedSymbols = [];

  //   // Combine ids and symbols
  //   const allSymbols = [...ids, ...symbols];

  //   // Remove specific symbols from the list
  //   const filteredSymbols = allSymbols.filter(
  //     (symbol) => !['RNDR', 'MYTHUSDC_4620BE'].includes(symbol)
  //   );

  //   // Process in batches
  //   for (let i = 0; i < filteredSymbols.length; i += batchSize) {
  //     const batch = filteredSymbols.slice(i, i + batchSize);
  //     const queryString = `symbol=${batch.join(',')}`;

  //     try {
  //       const response = await axios.get(
  //         `${this.baseUrl}/v2/cryptocurrency/info?${queryString}`,
  //         {
  //           headers: this.cmApiHeaders,
  //         }
  //       );

  //       const processedData = Object.values(response.data.data).flatMap(
  //         (cryptoArray: any[]) =>
  //           cryptoArray.map((crypto: any) => ({
  //             id: crypto.id,
  //             logo: crypto.logo,
  //             symbol: crypto.symbol,
  //             name: crypto.name,
  //             description: crypto.description,
  //           }))
  //       );
  //       console.log('getCryptoInfo SUCCEEDED', processedData);
  //       results.push(...processedData);
  //     } catch (err) {
  //       console.error(
  //         `Batch fetch failed for symbols: ${batch.join(',')}`,
  //         err
  //       );
  //       failedSymbols.push(...batch);
  //     }
  //   }

  //   // Log failed symbols
  //   if (failedSymbols.length > 0) {
  //     console.log('Failed symbols:', failedSymbols.join(','));
  //   } else {
  //     console.log('No failed symbols');
  //   }

  //   return {
  //     data: results,
  //     failedSymbols: failedSymbols,
  //   };
  // }

  // async getCryptoInfoAlert2(symbols: string[]): Promise<any> {
  //   const results = [];
  //   const notFoundSymbols = [];

  //   const allIdentifiers = [...symbols];

  //   for (const identifier of allIdentifiers) {
  //     // First, try to find the logo in the coingecko_search table
  //     let logoInfo = await this.coingeckoSearchRepository.findOne({
  //       where: [{ symbol: identifier.toUpperCase() }],
  //       select: ['symbol', 'large'],
  //     });

  //     if (logoInfo) {
  //       console.log('Found logo in coingecko_search table');
  //       results.push({
  //         identifier: identifier,
  //         symbol: logoInfo.symbol,
  //         logo: logoInfo.large,
  //       });
  //     } else {
  //       // If not found in coingecko_search, try the twelve_data_logo table
  //       const twelveDataLogoInfo = await this.twelveDataLogoRepository.findOne({
  //         where: { symbol: identifier.toUpperCase() },
  //         select: ['symbol', 'url', 'logoBase', 'logoQuote'],
  //       });

  //       if (twelveDataLogoInfo) {
  //         console.log('Found logo in twelve_data_logo table');
  //         results.push({
  //           identifier: identifier,
  //           symbol: twelveDataLogoInfo.symbol,
  //           logo:
  //             twelveDataLogoInfo.url ||
  //             twelveDataLogoInfo.logoBase ||
  //             twelveDataLogoInfo.logoQuote ||
  //             null,
  //         });
  //       } else {
  //         results.push({
  //           identifier: identifier,
  //           symbol: identifier.toUpperCase(),
  //           logo: null,
  //         });
  //         notFoundSymbols.push(identifier);
  //       }
  //     }
  //   }

  //   return {
  //     logos: results,
  //     notFoundSymbols: notFoundSymbols,
  //   };
  // }

  async getLatestListings(params: LatestListingsParams): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/cryptocurrency/listings/latest`,
        {
          headers: this.cmApiHeaders,
          params,
        }
      );
      console.log('getLatestListings SUCCEEDED', response.data);
      return response.data;
    } catch (err) {
      throw new HttpException(
        'Failed to fetch the latest listings from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getOhlcvHistorical(params: OhlcvHistoricalParams): Promise<any> {
    try {
      console.log('getOhlcvHistorical', params);
      const response = await axios.get(
        `${this.baseUrl}/v2/cryptocurrency/ohlcv/historical`,
        {
          headers: this.cmApiHeaders,
          params,
        }
      );
      console.log('getOhlcvHistorical SUCCEEDED', response.data);
      return response.data;
    } catch (err) {
      console.log('err => ', err);
      throw new HttpException(
        'Failed to fetch the cryptocurrency ohlcv historical listings from Coinmarketcap',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
