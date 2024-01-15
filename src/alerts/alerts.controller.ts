import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AlertService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Alert } from './entities/alerts.entity';
import { FilterAlertDto } from './dto/filter-alert.dto';

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

  @Post('/filter')
  @ApiOperation({
    summary: 'Get Filtered Alerts based on Bullish/Bearish and TF',
  })
  @ApiResponse({ status: 200, type: [Alert] })
  @ApiBody({ type: FilterAlertDto })
  async getFilteredAlerts(
    @Body(ValidationPipe) filterAlertDto: FilterAlertDto,
  ): Promise<Alert[]> {
    const { bullOrBear, tf } = filterAlertDto;
    return await this.alertService.getFilteredAlerts(bullOrBear, tf);
  }
}
