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
@ApiBearerAuth()
@ApiTags('Alerts')
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

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

  @Post('create-alert-stocks')
  @ApiOperation({ summary: 'Create a new stocks alert' })
  @ApiResponse({
    status: 201,
    description: 'The stocks alert has been successfully created.',
    type: Alert,
  })
  @ApiBody({ type: CreateAlertDto })
  async createStocksAlert(
    @Body(ValidationPipe) createAlertDto: CreateAlertDto
  ): Promise<Alert> {
    return await this.alertService.saveStocksAlertData(createAlertDto);
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
      page = Math.max(1, page); // Ensure page is at least 1
      // Ensure limit is between 1 and 100
      return await this.alertService.getFilteredAlerts(
        tf,
        alertType,
        daysAgo,
        ticker,
        page,
        limit,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error('Error fetching filtered alerts:', error);
      throw new HttpException(
        'Failed to fetch filtered alerts',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
