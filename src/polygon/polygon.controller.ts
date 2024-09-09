import { Polygon } from './entities/polygon.entity';
// polygon.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PolygonService } from './polygon.service';
import { Observable } from 'rxjs';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PolygonWebsocketService } from './polygon-websocket.service';
@ApiTags('Polygon Endpoints')
@Controller('py')
export class PolygonController {
  constructor(
    private readonly polygonWebsocketService: PolygonWebsocketService,
    private readonly polygonService: PolygonService
  ) {
    // Subscribe to messages
    this.polygonWebsocketService.messages$.subscribe((message) =>
      console.log('Received message:', message)
    );
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to Symbols' })
  subscribeToSymbols(@Body() body: { symbols: string[] }) {
    this.polygonWebsocketService.subscribe(body.symbols);
    return { message: 'Subscribed to symbols' };
  }

  @Post('unsubscribe')
  unsubscribeFromSymbols(@Body() body: { symbols: string[] }) {
    this.polygonWebsocketService.unsubscribe(body.symbols);
    return { message: 'Unsubscribed from symbols' };
  }

  @Get('tickers')
  @ApiOperation({ summary: 'Get Tickers' })
  getTickers(
    @Query('ticker') ticker: string,
    required: false
  ): Observable<any> {
    // console.log(ticker, active, limit)
    return this.polygonService.getTickers(ticker);
  }

  @Get('forex-snapshot')
  @ApiOperation({ summary: 'Get Crypto Snapshot' })
  getForexSnapshot(@Query('ticker') ticker: string): Observable<any> {
    return this.polygonService.getForexSnapshot(ticker);
  }

  @Get('crypto-snapshot')
  @ApiOperation({ summary: 'Get Crypto Snapshot' })
  getCryptoSnapshot(@Query('ticker') ticker: string): Observable<any> {
    return this.polygonService.getCryptoSnapshot(ticker);
  }

  @Get('aggregates')
  @ApiOperation({ summary: 'Get Crypto Aggregate' })
  @ApiQuery({
    name: 'ticker',
    type: String,
    required: true,
    description: 'The ticker of the cryptocurrency to fetch aggregates for',
  })
  @ApiQuery({
    name: 'multiplier',
    type: String,
    required: true,
    description:
      'The multiplier to use for the aggregates. For example, if timespan = ‘minute’ and multiplier = ‘5’ then 5-minute bars will be returned.',
  })
  @ApiQuery({
    name: 'timespan',
    type: String,
    required: true,
    description:
      'The size of the time window. Valid values are second, minute, hour, day, week, month, quarter, year',
  })
  @ApiQuery({
    name: 'from',
    type: String,
    required: true,
    description:
      'The start of the aggregate time window. Either a date with the format YYYY-MM-DD or a millisecond timestamp',
  })
  @ApiQuery({
    name: 'to',
    type: String,
    required: true,
    description:
      'The end of the aggregate time window. Either a date with the format YYYY-MM-DD or a millisecond timestamp',
  })
  getAggregates(
    @Query('ticker') ticker: string,
    @Query('multiplier') multiplier: string,
    @Query('timespan') timespan: string,
    @Query('from') from: string,
    @Query('to') to: string
  ): Promise<Observable<any>> {
    return this.polygonService.getAggregates(
      ticker,
      multiplier,
      timespan,
      from,
      to
    );
  }
}
