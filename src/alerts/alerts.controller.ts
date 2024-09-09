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
} from '@nestjs/common';
import { AlertService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Alert } from './entities/alerts.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// @ApiBearerAuth()
// @ApiTags('Alerts')
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get All Alerts!' })
  @ApiResponse({ status: 200, type: [Alert] })
  async getAllAlerts(): Promise<Alert[]> {
    return await this.alertService.getAllAlerts();
  }

  @Get('filter')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Filtered Alerts' })
  @ApiResponse({ status: 200, type: [Alert] })
  @ApiQuery({ name: 'tf', required: false, type: String })
  @ApiQuery({ name: 'alertType', required: false, type: String })
  @ApiQuery({ name: 'daysAgo', required: false, type: Number })
  @ApiQuery({ name: 'ticker', required: false, type: String })
  async getFilteredAlerts(
    @Query('tf') tf?: string,
    @Query('alertType') alertType?: string,
    @Query('daysAgo') daysAgo?: number,
    @Query('ticker') ticker?: string
  ): Promise<Alert[]> {
    return await this.alertService.getFilteredAlerts(
      tf,
      alertType,
      daysAgo,
      ticker
    );
  }
}
