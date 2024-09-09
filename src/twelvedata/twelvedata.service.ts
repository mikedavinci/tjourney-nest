// twelvedata.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  SymbolDataDto,
  SymbolSearchResponseDto,
} from './dto/symbol-search-response.dto';
import axios from 'axios';
import { TwelveDataSymbolSearch } from './entities/twelvedatum.entity';
import { LogoResponseDto } from './dto/logo-response.dto';
import { TwelveDataLogo } from './entities/twelve-data-logo.entity';
import { TwelveDataQuote } from './entities/twelve-data-quote.entity';
import { TwelveDataQuoteDto } from './dto/twelve-data-quote.dto';
import { TwelveDataTimeSeriesDto } from './dto/twelve-data-time-series.dto';
import { TimeSeriesCache } from './entities/time-series-cache.entity';
// import { TwelveDataQuoteWithLogoDto } from './dto/twelve-data-quote-logo.dto';

@Injectable()
export class TwelveDataService {
  private readonly baseUrl: string;
  private readonly apiHeaders: Record<string, string>;

  constructor(
    @InjectRepository(TwelveDataSymbolSearch)
    private twelveDataSymbolSearchRepository: Repository<TwelveDataSymbolSearch>,
    @InjectRepository(TwelveDataLogo)
    private twelveDataLogoRepository: Repository<TwelveDataLogo>,
    @InjectRepository(TwelveDataQuote)
    private twelveDataQuoteRepository: Repository<TwelveDataQuote>,
    @InjectRepository(TimeSeriesCache)
    private timeSeriesCacheRepository: Repository<TimeSeriesCache>,
    private configService: ConfigService
  ) {
    this.baseUrl = 'https://twelve-data1.p.rapidapi.com';
    this.apiHeaders = {
      'x-rapidapi-key': this.configService.get<string>('RAPIDAPI_KEY'),
      'x-rapidapi-host': this.configService.get<string>('RAPIDAPI_HOST_TWELVE'),
    };
  }
  async symbolSearch(symbol: string): Promise<SymbolSearchResponseDto> {
    try {
      const currencies = [
        'EUR', // Euro
        'USD', // US Dollar
        'GBP', // British Pound
        'JPY', // Japanese Yen
        'RUB', // Russian Ruble
        'CHF', // Swiss Franc
        'AUD', // Australian Dollar
        'CAD', // Canadian Dollar
        'NZD', // New Zealand Dollar
        'SGD', // Singapore Dollar
        'INR', // Indian Rupee
        'CNY', // Chinese Yuan
        'HKD', // Hong Kong Dollar
        'SEK', // Swedish Krona
        'NOK', // Norwegian Krone
        'MXN', // Mexican Peso
        'BRL', // Brazilian Real
        'ZAR', // South African Rand
        'TRY', // Turkish Lira
        'KRW', // South Korean Won
        'ARS', // Argentine Peso
        'THB', // Thai Baht
        'MYR', // Malaysian Ringgit
        'IDR', // Indonesian Rupiah
        'PLN', // Polish Zloty
        'PHP', // Philippine Peso
        'DKK', // Danish Krone
        'HUF', // Hungarian Forint
        'CZK', // Czech Koruna
        'AED', // United Arab Emirates Dirham
      ];
      const modifySymbol = function modifySymbol(symbol: string): string {
        if (symbol.length === 6) {
          const upperCaseSymbol = symbol.toUpperCase(); // Convert to uppercase

          const baseCurrency = upperCaseSymbol.slice(0, 3);
          const quoteCurrency = upperCaseSymbol.slice(3, 6);

          if (
            currencies.includes(baseCurrency) &&
            currencies.includes(quoteCurrency)
          ) {
            return `${baseCurrency}/${quoteCurrency}`;
          }
        }
        return symbol.toUpperCase();
      };

      const modifiedSymbol = modifySymbol(symbol);

      // Check if we have cached results for the modified symbol
      const cachedResults = await this.twelveDataSymbolSearchRepository.find({
        where: [
          { symbol: ILike(`${modifiedSymbol}%`) },
          { instrumentName: ILike(`${symbol}%`) },
        ],
        // take: 10,
        order: {
          country: 'DESC',
          symbol: 'ASC',
          instrumentName: 'ASC',
        },
      });

      // console.log('cachedResults', cachedResults);

      const validExchanges = ['NYSE', 'NASDAQ', 'CBOE', 'PHYSICAL CURRENCY'];

      if (cachedResults.length > 0) {
        const filteredCachedResults = cachedResults.filter((item) =>
          validExchanges.includes(item.exchange)
        );

        if (filteredCachedResults.length > 0) {
          // console.log('Using cached results for', modifiedSymbol);
          return this.formatCachedResults(filteredCachedResults);
        }
      }

      // console.log('Fetching new data from 12Data API for', modifiedSymbol);
      const response = await axios.get(`${this.baseUrl}/symbol_search`, {
        headers: this.apiHeaders,
        params: {
          symbol: symbol,
          outputsize: 30, // Increase this to get more results
        },
      });

      const filteredData = response.data.data.filter((item) =>
        validExchanges.includes(item.exchange)
      );

      // Fetch logos for filtered data
      const dataWithLogos = await Promise.all(
        filteredData.map(async (item) => {
          try {
            const logoData = await this.getLogo(item.symbol);
            return {
              ...item,
              logo: logoData.url,
            };
          } catch (error) {
            console.error(`Failed to fetch logo for ${item.symbol}:`, error);
            return item; // Return the item without logo if fetching fails
          }
        })
      );

      const sortedData = this.sortDataByCountry(dataWithLogos);
      await this.cacheResults(sortedData);

      // console.log('New data fetched and cached for', modifiedSymbol);
      return { ...response.data, data: sortedData };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch symbol search from Twelve Data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // New getLogo method
  async getLogo(symbol: string): Promise<LogoResponseDto> {
    try {
      // Check if we have cached results
      const cachedResult = await this.twelveDataLogoRepository.findOne({
        where: { symbol },
      });

      if (cachedResult) {
        return this.formatCachedLogoResult(cachedResult);
      }

      const response = await axios.get(`${this.baseUrl}/logo`, {
        headers: this.apiHeaders,
        params: { symbol },
      });

      // console.log('LOGO response', response.data);

      await this.cacheLogoResult(symbol, response.data);

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch logo from Twelve Data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getQuote(
    symbols: string[],
    interval: string
  ): Promise<Record<string, TwelveDataQuote>> {
    try {
      const quoteData = await this.fetchQuoteData(symbols, interval);
      console.log('Quote data:', quoteData);
      return quoteData;
    } catch (error) {
      console.error('Error in getQuote:', error);
      throw new HttpException(
        'Failed to fetch quote from Twelve Data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  // fetch quote data for multiple symbols
  private async fetchQuoteData(
    symbols: string[],
    interval: string
  ): Promise<Record<string, TwelveDataQuote>> {
    const result: Record<string, TwelveDataQuoteDto> = {};
    const symbolsToFetch: string[] = [];

    // Check cache for quotes
    const cacheTime = 1 * 60 * 1000; // 1 minute
    const validCacheDate = new Date(new Date().getTime() - cacheTime);

    const cachedQuotes = await this.twelveDataQuoteRepository.find({
      where: [
        ...symbols.map((symbol) => ({
          symbol: ILike(`${symbol}%`),
          updatedDate: MoreThanOrEqual(validCacheDate),
        })),
      ],
    });

    console.log('Cached quotes:', cachedQuotes);

    for (const symbol of symbols) {
      const cachedQuote = cachedQuotes.find((q) => q.symbol === symbol);
      if (cachedQuote && this.isCacheValid(cachedQuote.updatedDate)) {
        console.log('Using cached data for symbol:', symbol);
        result[symbol] = this.formatCachedQuote(cachedQuote);
      } else {
        console.log('Need to fetch data for symbol:', symbol);
        symbolsToFetch.push(symbol);
      }
    }

    if (symbolsToFetch.length > 0) {
      console.log('Fetching data from API for symbols:', symbolsToFetch);
      try {
        const response = await axios.get<Record<string, TwelveDataQuoteDto>>(
          `${this.baseUrl}/quote`,
          {
            headers: this.apiHeaders,
            params: {
              symbol: symbolsToFetch.join(','),
              interval,
            },
          }
        );

        console.log('API response:', response.data);
        const validQuotes = Object.entries(response.data).filter(
          ([symbol, quoteData]) => quoteData && symbol
        );

        for (const [symbol, quoteData] of validQuotes) {
          result[symbol] = quoteData as TwelveDataQuoteDto;
          console.log('resultddddddddddddd', result);

          // Create a complete quote object for caching
          const quoteToCache = { [symbol]: quoteData };
          await this.cacheQuotes(quoteToCache);
        }
      } catch (error) {
        console.error('Error fetching quote data from API:', error);
        throw error;
      }
    }

    console.log('Final result from fetchQuoteData:', result);
    return result;
  }

  // fetches quaote data for a single symbol
  private async fetchQuoteDataSingle(
    symbol: string,
    interval: string
  ): Promise<TwelveDataQuoteDto> {
    // Check cache for quote
    const cachedQuote = await this.twelveDataQuoteRepository.findOne({
      where: { symbol },
    });

    if (cachedQuote && this.isCacheValid(cachedQuote.updatedDate)) {
      return this.formatCachedQuote(cachedQuote);
    }

    // Fetch from API if not in cache or cache is invalid
    const response = await axios.get<TwelveDataQuoteDto>(
      `${this.baseUrl}/quote`,
      {
        headers: this.apiHeaders,
        params: {
          symbol,
          interval,
        },
      }
    );

    // Cache the result
    await this.cacheQuote(response.data);

    return response.data;
  }

  private async fetchLogoData(symbol: string): Promise<LogoResponseDto> {
    // Check if we have cached results
    // console.log('Fetching logo data for symbol:', symbol);

    const cachedResult = await this.twelveDataLogoRepository.findOne({
      where: { symbol },
    });

    if (cachedResult) {
      // console.log('Using cached logo data for symbol:', symbol);

      return this.formatCachedLogoResult(cachedResult);
    }
    // console.log('Fetching logo data from API for symbol:', symbol);

    try {
      const response = await axios.get<LogoResponseDto>(
        `${this.baseUrl}/logo`,
        {
          headers: this.apiHeaders,
          params: { symbol },
        }
      );
      // console.log('API response for logo:', response.data);

      await this.cacheLogoResult(symbol, response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching logo data from API:', error);
      throw error;
    }
  }

  async getQuoteOG(
    symbol: string,
    interval: string
  ): Promise<TwelveDataQuoteDto> {
    try {
      // Check cache
      const cachedQuote = await this.twelveDataQuoteRepository.findOne({
        where: { symbol },
      });
      if (cachedQuote && this.isCacheValid(cachedQuote.updatedDate)) {
        return this.formatCachedQuote(cachedQuote);
      }

      const interval = '1day';

      // Fetch from API if not in cache or cache is invalid
      const response = await axios.get<TwelveDataQuoteDto>(
        `${this.baseUrl}/quote`,
        {
          headers: this.apiHeaders,
          params: {
            symbol,
            interval,
          },
        }
      );
      // console.log('response', response.data);
      // Cache the result
      await this.cacheQuote(response.data);

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch quote from Twelve Data',
        error.response?.status || 500
      );
    }
  }

  async getTimeSeries(symbol: string): Promise<TwelveDataTimeSeriesDto> {
    try {
      // Check if the data is cached
      const cachedData = await this.timeSeriesCacheRepository.findOne({
        where: { symbol },
      });

      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes in milliseconds

      // If data is cached and fresh, return it
      if (cachedData && cachedData.updatedAt > fifteenMinutesAgo) {
        return cachedData.data;
      }

      // Fetch new data from Twelve Data API
      const response = await axios.get<TwelveDataTimeSeriesDto>(
        `${this.baseUrl}/time_series`,
        {
          headers: this.apiHeaders,
          params: {
            symbol,
            outputsize: 300,
            interval: '1day',
            format: 'json',
          },
        }
      );

      const newData = response.data;

      // Save the new data
      await this.saveTimeSeries(symbol, newData);

      return newData;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch time series data from Twelve Data',
        error.response?.status || 500
      );
    }
  }

  private async cacheQuote(quoteData: TwelveDataQuoteDto): Promise<void> {
    const quote = this.twelveDataQuoteRepository.create({
      symbol: quoteData.symbol,
      name: quoteData.name,
      exchange: quoteData.exchange,
      datetime: quoteData.datetime,
      timestamp: quoteData.timestamp,
      open: quoteData.open,
      high: quoteData.high,
      low: quoteData.low,
      close: quoteData.close,
      previous_close: quoteData.previous_close,
      change: quoteData.change,
      percent_change: quoteData.percent_change,
      is_market_open: quoteData.is_market_open,
      fifty_two_week: quoteData.fifty_two_week,
    });

    await this.twelveDataQuoteRepository.save(quote);
  }

  private formatCachedQuote(cachedQuote: TwelveDataQuote): TwelveDataQuoteDto {
    return {
      id: cachedQuote.id.toString(),
      symbol: cachedQuote.symbol,
      name: cachedQuote.name,
      exchange: cachedQuote.exchange,
      datetime: cachedQuote.datetime,
      timestamp: cachedQuote.timestamp,
      open: cachedQuote.open,
      high: cachedQuote.high,
      low: cachedQuote.low,
      close: cachedQuote.close,
      previous_close: cachedQuote.previous_close,
      change: cachedQuote.change,
      percent_change: cachedQuote.percent_change,
      is_market_open: cachedQuote.is_market_open,
      fifty_two_week:
        cachedQuote.fifty_two_week as TwelveDataQuoteDto['fifty_two_week'],
      updatedDate: cachedQuote.updatedDate,
    };
  }

  private isCacheValid(updatedDate: Date): boolean {
    const cacheTime = 1 * 60 * 1000; // 1 minutes
    return new Date().getTime() - updatedDate.getTime() < cacheTime;
  }

  private async cacheQuotes(
    quotesData: Record<string, TwelveDataQuoteDto>
  ): Promise<void> {
    console.log('Incoming quotesData:', quotesData);

    const quotes = Object.entries(quotesData)
      .map(([symbol, quoteData]) => {
        if (typeof quoteData === 'object' && quoteData !== null && symbol) {
          const cleanedQuote = {
            symbol: symbol,
            name: quoteData.name,
            exchange: quoteData.exchange,
            datetime: quoteData.datetime,
            timestamp: quoteData.timestamp,
            open: quoteData.open,
            high: quoteData.high,
            low: quoteData.low,
            close: quoteData.close,
            previous_close: quoteData.previous_close,
            change: quoteData.change,
            percent_change: quoteData.percent_change,
            is_market_open: quoteData.is_market_open,
            fifty_two_week: quoteData.fifty_two_week,
            updatedDate: new Date(),
          };

          return cleanedQuote;
        } else {
          console.log(`Invalid quote data for symbol ${symbol}:`, quoteData);
          return null;
        }
      })
      .filter((quote) => quote !== null);

    if (quotes.length === 0) {
      console.log('No valid quotes to cache');
      return;
    }

    try {
      console.log('Quotes to be cached:', quotes);
      await this.twelveDataQuoteRepository.upsert(quotes, ['symbol']);
      console.log(`Successfully cached ${quotes.length} quotes`);
    } catch (error) {
      console.log(`Error caching quotes: ${error.message}`, error.stack);
      throw error;
    }
  }
  //   private async addLogosToResults(data: SymbolDataDto[]): Promise<SymbolDataDto[]> {
  //   const logoPromises = data.map(item => this.getLogo(item.symbol));
  //   const logos = await Promise.all(logoPromises);

  //   return data.map((item, index) => ({
  //     ...item,
  //     logo: logos[index].url || logos[index].logo_base,
  //   }));
  // }

  private async cacheLogoResult(
    symbol: string,
    data: LogoResponseDto
  ): Promise<void> {
    const entityToSave = this.twelveDataLogoRepository.create({
      symbol: data.meta.symbol,
      url: data.url,
      logoBase: data.logo_base,
      logoQuote: data.logo_quote,
    });

    await this.twelveDataLogoRepository.save(entityToSave);
  }

  private formatCachedLogoResult(
    cachedResult: TwelveDataLogo
  ): LogoResponseDto {
    const result: LogoResponseDto = {
      meta: {
        symbol: cachedResult.symbol,
      },
    };

    if (cachedResult.url) {
      result.url = cachedResult.url;
    }

    if (cachedResult.logoBase && cachedResult.logoQuote) {
      result.logo_base = cachedResult.logoBase;
      result.logo_quote = cachedResult.logoQuote;
    }

    return result;
  }

  private async cacheResults(data: SymbolDataDto[]): Promise<void> {
    const entitiesToSave = data
      .filter((item) => item.symbol !== null) // Filter out items where instrument_name is null
      .map((item) =>
        this.twelveDataSymbolSearchRepository.create({
          symbol: item.symbol,
          instrumentName: item.instrument_name,
          exchange: item.exchange,
          micCode: item.mic_code,
          exchangeTimezone: item.exchange_timezone,
          instrumentType: item.instrument_type,
          country: item.country,
          currency: item.currency,
          logo: item.logo,
        })
      );

    if (entitiesToSave.length > 0) {
      await this.twelveDataSymbolSearchRepository.save(entitiesToSave);
      console.log(`Successfully cached ${entitiesToSave.length} entities.`);
    } else {
      console.log('No valid entities to cache.');
    }
  }

  private formatCachedResults(
    cachedResults: TwelveDataSymbolSearch[]
  ): SymbolSearchResponseDto {
    return {
      data: cachedResults.map((result) => ({
        symbol: result.symbol,
        instrument_name: result.instrumentName,
        exchange: result.exchange,
        mic_code: result.micCode,
        exchange_timezone: result.exchangeTimezone,
        instrument_type: result.instrumentType,
        country: result.country,
        currency: result.currency,
        logo: result.logo,
      })),
      status: 'ok',
    };
  }

  private sortDataByCountry(data: SymbolDataDto[]): SymbolDataDto[] {
    return data.sort((a, b) => {
      if (a.country === 'United States' && b.country !== 'United States') {
        return -1;
      }
      if (a.country !== 'United States' && b.country === 'United States') {
        return 1;
      }
      return a.symbol.localeCompare(b.symbol);
    });
  }

  private async saveTimeSeries(
    symbol: string,
    data: TwelveDataTimeSeriesDto
  ): Promise<void> {
    const existingData = await this.timeSeriesCacheRepository.findOne({
      where: { symbol },
    });

    if (existingData) {
      existingData.data = data;
      existingData.updatedAt = new Date();
      await this.timeSeriesCacheRepository.save(existingData);
    } else {
      const newTimeSeriesCache = this.timeSeriesCacheRepository.create({
        symbol,
        data,
        updatedAt: new Date(),
      });
      await this.timeSeriesCacheRepository.save(newTimeSeriesCache);
    }
  }
}
