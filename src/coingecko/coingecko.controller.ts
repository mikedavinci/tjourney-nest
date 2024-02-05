import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CoinGeckoService } from './coingecko.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

// export interface CoinGeckoListingsParams {
//   vs_currency: string;
//   order?: string;
//   per_page?: number;
//   page?: number;
//   sparkline?: boolean;
// }

// export interface CoinGeckoMarketChartDataParams {
//   id: string;
//   vs_currency: string;
//   days: string;
//   interval?: string;
// }

// export interface CoinGeckoSingleCoinDataParams {
//   id: string;
//   localization?: boolean;
//   tickers?: boolean;
//   market_data?: boolean;
//   community_data?: boolean;
//   developer_data?: boolean;
//   sparkline?: boolean;
// }
@ApiBearerAuth()
@ApiTags('Coingecko')
@UseGuards(JwtAuthGuard)
@Controller('coingecko')
export class CoinGeckoController {
  constructor(private readonly coinGeckoService: CoinGeckoService) {}

  @Get('coins/list')
  @ApiOperation({ summary: 'Get coins list' })
  async getCoinList() {
    return this.coinGeckoService.getCoinList();
  }

  // @Get('coins/market_chart/range')
  // @ApiQuery({ name: 'id', type: String })
  // @ApiQuery({ name: 'vs_currency', type: String })
  // @ApiQuery({ name: 'days', type: String })
  // @ApiQuery({ name: 'interval', type: String, required: false })
  // async getMarketChartRange(@Query() params: CoinGeckoMarketChartDataParams) {
  //   return this.coinGeckoService.getMarketChartRange(params);
  // }

  // @Get('coins/:id')
  // @ApiQuery({ name: 'id', type: String })
  // @ApiQuery({ name: 'localization', type: Boolean, required: false })
  // @ApiQuery({ name: 'tickers', type: Boolean, required: false })
  // @ApiQuery({ name: 'market_data', type: Boolean, required: false })
  // @ApiQuery({ name: 'community_data', type: Boolean, required: false })
  // @ApiQuery({ name: 'developer_data', type: Boolean, required: false })
  // @ApiQuery({ name: 'sparkline', type: Boolean, required: false })
  // async getSingleCoinData(@Query() params: CoinGeckoSingleCoinDataParams) {
  //   return this.coinGeckoService.getSingleCoinData(params);
  // }

  // Add more endpoints as needed
}
