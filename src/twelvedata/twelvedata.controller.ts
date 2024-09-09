// twelvedata.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { TwelveDataService } from './twelvedata.service';

import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SymbolSearchResponseDto } from './dto/symbol-search-response.dto';
import { LogoResponseDto } from './dto/logo-response.dto';
import { TwelveDataQuoteDto } from './dto/twelve-data-quote.dto';
import { TwelveDataTimeSeriesDto } from './dto/twelve-data-time-series.dto';
// import { TwelveDataQuoteWithLogoDto } from './dto/twelve-data-quote-logo.dto';
import { TwelveDataQuote } from './entities/twelve-data-quote.entity';

@ApiTags('Twelve Data')
@Controller('twelvedata')
export class TwelvedataController {
  constructor(private readonly twelveDataService: TwelveDataService) {}

  @Get('time-series')
  @ApiOperation({ summary: 'Get time series data for a symbol' })
  @ApiQuery({
    name: 'symbol',
    required: true,
    description: 'Instrument symbol',
  })
  async getTimeSeries(
    @Query('symbol') symbol: string
  ): Promise<TwelveDataTimeSeriesDto> {
    return this.twelveDataService.getTimeSeries(symbol);
  }

  @Get('symbol_search')
  @ApiOperation({
    summary: 'Search for symbols',
    description: 'Search for symbols using Twelve Data API',
  })
  @ApiQuery({
    name: 'symbol',
    type: String,
    required: true,
    description: 'The symbol to search for',
  })
  @ApiQuery({
    name: 'outputsize',
    type: Number,
    required: false,
    description: 'Number of results to return (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    type: SymbolSearchResponseDto,
  })
  async symbolSearch(
    @Query('symbol') symbol: string,
    @Query('outputsize') outputsize: number
  ): Promise<SymbolSearchResponseDto> {
    return this.twelveDataService.symbolSearch(symbol);
  }

  // New logo endpoint
  @Get('logo')
  @ApiOperation({
    summary: 'Get company logo URLs',
    description: 'Retrieve the logo URL(s) for a given stock or forex symbol',
  })
  @ApiQuery({
    name: 'symbol',
    type: String,
    required: true,
    description: 'The symbol to get the logo(s) for',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    type: LogoResponseDto,
  })
  async getLogo(@Query('symbol') symbol: string): Promise<LogoResponseDto> {
    return this.twelveDataService.getLogo(symbol);
  }

  @Get('quote')
  @ApiOperation({ summary: 'Get quote data for a symbol' })
  @ApiQuery({
    name: 'symbol',
    required: true,
    description: 'Instrument symbol',
  })
  @ApiQuery({
    name: 'outputsize',
    required: false,
    type: 'number',
    description: 'Number of data points (default: 30)',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    type: 'string',
    description: 'Format of the data (default: json)',
  })
  @ApiQuery({
    name: 'interval',
    required: false,
    type: 'string',
    description: 'Time interval (default: 1day)',
  })
  async getQuote(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string = '1day'
  ): Promise<Record<string, TwelveDataQuote>> {
    const symbols = symbol.split(',').map((s) => s);
    return this.twelveDataService.getQuote(symbols, interval);
  }
}
