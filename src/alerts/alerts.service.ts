// Service
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import * as moment from 'moment';
import { AlertRepository } from './entities/alert.repository';
@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(AlertRepository)
    private alertRepository: AlertRepository
  ) {}

  // async saveAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
  //   // Convert CreateAlertDto to a JSON string
  //   const alertDataString = JSON.stringify(createAlertDto);

  //   // Parse the JSON string back to an object (if needed)
  //   let parsedData: CreateAlertDto;
  //   try {
  //     parsedData = JSON.parse(alertDataString);
  //   } catch (error) {
  //     throw new Error('Invalid JSON format');
  //   }

  //   // Create a new alert with the parsed data
  //   const alert = this.alertRepository.create({
  //     alert_data: parsedData,
  //   });

  //   // Save the alert in the database
  //   return await this.alertRepository.save(alert);
  // }

  async saveAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      isStocksAlert: false,
      isForexAlert: false,
    });
  
    return await this.alertRepository.save(alert);
  }

  async saveForexAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      isStocksAlert: false,
      isForexAlert: true,
    });
  
    return await this.alertRepository.save(alert);
  }

  async saveStockAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      isStocksAlert: true,
      isForexAlert: false,
    });

    return await this.alertRepository.save(alert);
  }

  // async saveStocksAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
  //   // Convert CreateAlertDto to a JSON string
  //   const alertDataString = JSON.stringify(createAlertDto);

  //   // Parse the JSON string back to an object (if needed)
  //   let parsedData: CreateAlertDto;
  //   try {
  //     parsedData = JSON.parse(alertDataString);
  //   } catch (error) {
  //     throw new Error('Invalid JSON format');
  //   }

  //   // Create a new alert with the parsed data
  //   const alert = this.alertRepository.create({
  //     alert_data: parsedData,
  //     isStocksAlert: true,
  //   });

  //   // Save the alert in the database
  //   return await this.alertRepository.save(alert);
  // }

  // async saveForexAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
  //   // Convert CreateAlertDto to a JSON string
  //   const alertDataString = JSON.stringify(createAlertDto);

  //   // Parse the JSON string back to an object (if needed)
  //   let parsedData: CreateAlertDto;
  //   try {
  //     parsedData = JSON.parse(alertDataString);
  //   } catch (error) {
  //     throw new Error('Invalid JSON format');
  //   }

  //   // Create a new alert with the parsed data
  //   const alert = this.alertRepository.create({
  //     alert_data: parsedData,
  //     isForexAlert: true,
  //   });

  //   // Save the alert in the database
  //   return await this.alertRepository.save(alert);
  // }

  async getAllAlerts(
    page: number = 1,
    limit: number
  ): Promise<{ alerts: Alert[]; total: number }> {
    try {
      return await this.alertRepository.getAllAlertsWithPagination(page, limit);
    } catch (error) {
      console.error('Error fetching all alerts:', error);
      throw error;
    }
  }

  async getFilteredAlerts(
    tf?: string,
    alertType?: string,
    daysAgo?: number,
    ticker?: string,
    page: number = 1,
    limit?: number,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ alerts: Alert[]; total: number }> {
    return await this.alertRepository.getFilteredAlerts(
      tf,
      alertType,
      daysAgo,
      ticker,
      page,
      limit,
      sortBy,
      sortOrder
    );
  }
}
