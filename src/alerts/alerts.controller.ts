import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { AlertService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Alert } from './entities/alert.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import {
  ClerkExpressRequireAuth,
  RequireAuthProp,
  StrictAuthProp,
} from '@clerk/clerk-sdk-node';
import { MT4SignalResponseDto } from './dto/mt4-signal.dto';
import { LuxAlgoAlert } from './entities/luxalgo.entity';
import { LuxAlgoAlertDto } from './dto/luxalgo-alert.dto';
import { LoggerService } from './services/logger.service';

@ApiBearerAuth()
@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
  constructor(
    private readonly alertService: AlertService,
    private readonly loggerService: LoggerService
  ) {}

  @Post('create-alert')
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiResponse({
    status: 201,
    description: 'The alert has been successfully created.',
    type: Alert,
  })
  @ApiBody({ type: CreateAlertDto })
  async createAlert(
    @Body(ValidationPipe) createAlertDto: CreateAlertDto
  ): Promise<Alert> {
    return await this.alertService.saveAlertData(createAlertDto);
  }

  // @Post('create-alert-stocks')
  // @ApiOperation({ summary: 'Create a new stocks alert' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The stocks alert has been successfully created.',
  //   type: Alert,
  // })
  // @ApiBody({ type: CreateAlertDto })
  // async createStocksAlert(
  //   @Body(ValidationPipe) createAlertDto: CreateAlertDto
  // ): Promise<Alert> {
  //   return await this.alertService.saveStockAlertData(createAlertDto);
  // }

  @Post('create-alert-forex')
  @ApiOperation({ summary: 'Create a new forex alert' })
  @ApiResponse({
    status: 201,
    description: 'The forex alert has been successfully created.',
    type: Alert,
  })
  @ApiBody({ type: CreateAlertDto })
  async createForexAlert(
    @Body(ValidationPipe) createAlertDto: CreateAlertDto
  ): Promise<Alert> {
    return await this.alertService.saveForexAlertData(createAlertDto);
  }

  @Get()
  // @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get All Alerts' })
  @ApiResponse({ status: 200, type: [Alert] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllAlerts(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number
  ): Promise<{ alerts: Alert[]; total: number }> {
    try {
      page = Math.max(1, page); // Ensure page is at least 1
      limit = Math.min(100, Math.max(1, limit)); // Ensure limit is between 1 and 100
      return await this.alertService.getAllAlerts(page, limit);
    } catch (error) {
      console.error('Error fetching all alerts:', error);
      throw new HttpException(
        'Failed to fetch alerts',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('filter')
  // @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get Filtered Alerts' })
  @ApiResponse({ status: 200, type: [Alert] })
  @ApiQuery({ name: 'tf', required: false, type: String })
  @ApiQuery({ name: 'alertType', required: false, type: String })
  @ApiQuery({ name: 'daysAgo', required: false, type: Number })
  @ApiQuery({ name: 'ticker', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async getFilteredAlerts(
    @Query('tf') tf?: string,
    @Query('alertType') alertType?: string,
    @Query('daysAgo', new ParseIntPipe({ optional: true })) daysAgo?: number,
    @Query('ticker') ticker?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ alerts: Alert[]; total: number }> {
    try {
      page = Math.max(1, page);
      const result = await this.alertService.getFilteredAlerts(
        tf,
        alertType,
        daysAgo,
        ticker,
        page,
        limit,
        sortBy,
        sortOrder
      );

      // Transform the result to include isStocksAlert
      const transformedAlerts = result.alerts.map((alert) => ({
        ...alert,
        isStocksAlert: alert.isStocksAlert,
        isForexAlert: alert.isForexAlert,
      }));

      return {
        alerts: transformedAlerts,
        total: result.total,
      };
    } catch (error) {
      console.error('Error fetching filtered alerts:', error);
      throw new HttpException(
        'Failed to fetch filtered alerts',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('mt4-forex-signals')
  @ApiOperation({
    summary: 'Get MT4 Forex Signals for supported pairs',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest forex signals for MT4',
    type: [MT4SignalResponseDto],
  })
  @ApiQuery({
    name: 'tf',
    required: false,
    description: 'Timeframe (1 = 1min, 15 = 15min, 60 = 1h, 240 = 4h)',
  })
  @ApiQuery({
    name: 'pairs',
    required: false,
    description: 'Comma-separated list of pairs',
  })
  async getMT4Signals(
    @Query('pairs') pairs?: string,
    @Query('tf') timeframe: string = '240' // Default to H4 timeframe
  ): Promise<MT4SignalResponseDto[]> {
    // console.log(
    //   'Received request with timeframe:',
    //   timeframe,
    //   'and pairs:',
    //   pairs
    // );

    const allowedPairs = [
      'EURUSD',
      'AUDUSD',
      'USDJPY',
      'GBPUSD',
      'BTCUSD',
      'ETHUSD',
      'LTCUSD',
    ];
    const requestedPairs = pairs ? pairs.split(',') : allowedPairs;

    // Filter out any pairs that aren't in our allowed list
    const validPairs = requestedPairs.filter((pair) =>
      allowedPairs.includes(pair)
    );

    // Normalize timeframe
    const validTimeframes = ['1', '15', '60', '240'];
    if (!validTimeframes.includes(timeframe)) {
      console.log('Invalid timeframe:', timeframe, 'defaulting to 240');
      timeframe = '240';
    }

    return await this.alertService.getMT4Signals(validPairs, timeframe);
  }

  @Post('luxalgo')
  @ApiOperation({ summary: 'Save LuxAlgo alert data' })
  @ApiResponse({
    status: 201,
    description: 'The LuxAlgo alert has been successfully saved',
    type: LuxAlgoAlert,
  })
  @ApiBody({ type: LuxAlgoAlertDto })
  async saveLuxAlgoAlert(@Body() body: any): Promise<LuxAlgoAlert> {
    try {
      console.log('📥 Received raw webhook data:', body);

      // Try to extract data from the webhook payload
      const alertDto: LuxAlgoAlertDto = {
        alert_data: body, // Store the entire payload as alert_data
        ticker: body.ticker || body.symbol || body.pair,
        tf: body.tf || body.timeframe || '240',
        bartime: body.bartime || body.time || Date.now(),
      };

      console.log('🔄 Processed webhook data into DTO:', alertDto);

      const result = await this.alertService.saveLuxAlgoAlert(alertDto);
      console.log('✅ Successfully saved LuxAlgo alert with ID:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error saving LuxAlgo alert:', error);
      throw new HttpException(
        'Failed to save LuxAlgo alert',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('luxalgo/:ticker')
  @ApiOperation({ summary: 'Get latest LuxAlgo alert for a ticker' })
  @ApiResponse({ status: 200, type: LuxAlgoAlert })
  @ApiQuery({
    name: 'tf',
    required: false,
    description: 'Timeframe (e.g., 240 for H4)',
  })
  async getLatestLuxAlgoAlert(
    @Param('ticker') ticker: string,
    @Query('tf') timeframe?: string
  ): Promise<LuxAlgoAlert> {
    try {
      console.log('🔍 Fetching latest LuxAlgo alert:', { ticker, timeframe });
      const result = await this.alertService.getLatestLuxAlgoAlert(
        ticker,
        timeframe
      );
      console.log('✅ Found LuxAlgo alert:', {
        id: result.id,
        ticker: result.ticker,
        tf: result.tf,
        bartime: result.bartime,
      });
      return result;
    } catch (error) {
      console.error('❌ Error fetching LuxAlgo alert:', error);
      throw error;
    }
  }

  @Get('luxalgo')
  @ApiOperation({ summary: 'Get all LuxAlgo alerts' })
  @ApiResponse({ status: 200, type: [LuxAlgoAlert] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'ticker', required: false, type: String })
  @ApiQuery({ name: 'tf', required: false, type: String })
  async getLuxAlgoAlerts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('ticker') ticker?: string,
    @Query('tf') timeframe?: string
  ): Promise<{ alerts: LuxAlgoAlert[]; total: number }> {
    try {
      console.log('🔍 Fetching LuxAlgo alerts with params:', {
        page: page || 1,
        limit: limit || 10,
        ticker: ticker || 'all',
        timeframe: timeframe || 'all',
      });

      const result = await this.alertService.getLuxAlgoAlerts(
        page,
        limit,
        ticker,
        timeframe
      );

      console.log(
        `✅ Retrieved ${result.alerts.length} LuxAlgo alerts out of ${result.total} total`
      );
      return result;
    } catch (error) {
      console.error('❌ Error fetching LuxAlgo alerts:', error);
      throw new HttpException(
        'Failed to fetch LuxAlgo alerts',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('log')
  @ApiOperation({ summary: 'Send logs to Papertrail' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        level: { type: 'string', enum: ['info', 'error', 'warn'] },
        metadata: { type: 'object' },
      },
      required: ['message'],
    },
  })
  async sendLog(
    @Body()
    logData: {
      message: string;
      level?: 'info' | 'error' | 'warn';
      metadata?: any;
    }
  ) {
    const { message, level = 'info', metadata } = logData;

    switch (level) {
      case 'error':
        this.loggerService.error(message, metadata);
        break;
      case 'warn':
        this.loggerService.warn(message, metadata);
        break;
      default:
        this.loggerService.log(message, metadata);
    }

    return { success: true, message: 'Log sent to Papertrail' };
  }
}
