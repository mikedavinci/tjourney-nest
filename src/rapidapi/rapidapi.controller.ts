import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RapidapiService } from './rapidapi.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StockSearchResponseDto } from './dto/search-stock.dto';

@ApiTags('Rapi Endpoints')
@Controller('rdapi')
export class RapidapiController {
  constructor(private readonly rapidapiService: RapidapiService) {}

  @Get('stocks-search')
  @ApiQuery({
    name: 'ticker',
    required: false,
    description: 'Ticker of the stock',
  })
  @ApiQuery({
    name: 'security',
    required: false,
    description: 'Security of the stock',
  })
  @ApiOperation({ summary: 'Get Stock Search' })
  async searchStock(
    @Query('ticker') ticker?: string,
    @Query('security') security?: string
  ): Promise<StockSearchResponseDto[]> {
    return this.rapidapiService.searchStock(ticker, security);
  }
}
