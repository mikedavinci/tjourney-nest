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
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AlertService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Alert } from './entities/alerts.entity';

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
    @Body(ValidationPipe) createAlertDto: CreateAlertDto,
  ): Promise<Alert> {
    return await this.alertService.saveAlertData(createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Alerts!' })
  @ApiResponse({ status: 200, type: [Alert] })
  async getAllAlerts(): Promise<Alert[]> {
    return await this.alertService.getAllAlerts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an Alert by ID' })
  @ApiResponse({ status: 200, type: Alert })
  async getAlertById(@Param('id', ParseIntPipe) id: number): Promise<Alert> {
    return await this.alertService.getAlertById(id);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Get Filtered Alerts' })
  @ApiResponse({ status: 200, type: [Alert] })
  @ApiQuery({ name: 'tf', required: false, type: String })
  // @ApiQuery({ name: 'alertType', required: false, type: String })
  // @ApiQuery({ name: 'createdAt', required: false, type: String })
  async getFilteredAlerts(
    @Query('tf') tf?: string,
    // @Query('alertType') alertType?: string,
    // @Query('createdAt') createdAt?: string,
  ): Promise<Alert[]> {
    console.log({ tf }); // Log to see the actual values received
    return await this.alertService.getFilteredAlerts(tf);
  }
}
