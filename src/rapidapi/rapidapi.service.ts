import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { SearchStock } from './entities/rapidapi.entity';
import { Like, Repository } from 'typeorm';
import { StockSearchResponseDto } from './dto/search-stock.dto';

@Injectable()
export class RapidapiService {
  constructor(
    @InjectRepository(SearchStock)
    private searchStockRepository: Repository<SearchStock>,
    private configService: ConfigService
  ) {}

  async searchStock(
    ticker?: string,
    security?: string
  ): Promise<StockSearchResponseDto[]> {
    // Check if the stock data exists in the database
    let stockData = await this.searchStockRepository.find({
      where: [{ ticker }, { security_name: Like(`%${security}%`) }],
    });

    if (stockData.length > 0) {
      // If found in database, return it
      return stockData.map((stock) => ({
        exchange: stock.exchange,
        ticker: stock.ticker,
        security_name: stock.security_name,
        is_etf: stock.is_etf,
        last_updated: stock.last_updated,
        search_type: stock.search_type,
        similarity_score: stock.similarity_score,
      }));
    }

    const options = {
      method: 'GET',
      url: 'https://stock-ticker-security-and-company-search-database.p.rapidapi.com/all_search',
      params: { ticker, security },
      headers: {
        'x-rapidapi-key': this.configService.get<string>('RAPIDAPI_KEY'),
        'x-rapidapi-host': this.configService.get<string>(
          'RAPIDAPI_HOST_STOCKS_SEARCH'
        ),
      },
    };

    try {
      const response = await axios.request(options);
      const apiData: StockSearchResponseDto[] = response.data;

      // Save the data to the database
      await Promise.all(
        apiData.map(async (stock) => {
          const newStock = this.searchStockRepository.create(stock);
          await this.searchStockRepository.save(newStock);
        })
      );

      return apiData;
    } catch (error) {
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
  }
}
