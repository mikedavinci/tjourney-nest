// Service
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alerts.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import * as moment from 'moment';
@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async saveAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    // Convert CreateAlertDto to a JSON string
    const alertDataString = JSON.stringify(createAlertDto);

    // Parse the JSON string back to an object (if needed)
    let parsedData: CreateAlertDto;
    try {
      parsedData = JSON.parse(alertDataString);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }

    // Create a new alert with the parsed data
    const alert = this.alertRepository.create({
      alert_data: parsedData,
    });

    // Save the alert in the database
    return await this.alertRepository.save(alert);
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await this.alertRepository.find();
  }

  async getFilteredAlerts(
    tf?: string,
    alertType?: string,
    daysAgo?: number,
    ticker?: string,
  ): Promise<Alert[]> {
    const query = this.alertRepository.createQueryBuilder('alert');

    if (tf) {
      query.andWhere("alert.alert_data ->> 'tf' = :tf", { tf });
    }
    if (alertType) {
      query.andWhere("alert.alert_data ->> 'alert' ILIKE :alertType", {
        alertType: `%${alertType}%`,
      });
    }

    if (daysAgo) {
      const dateLimit = moment().subtract(daysAgo, 'days').toDate();
      query.andWhere('alert.createdAt > :dateLimit', { dateLimit });
    }

    if (ticker) {
      query.andWhere("alert.alert_data ->> 'ticker' = :ticker", { ticker });
    }

    return await query.getMany();
  }
}
