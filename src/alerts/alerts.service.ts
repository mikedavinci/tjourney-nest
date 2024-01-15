// Service
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alerts.entity';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async saveAlertData(createAlertDto: string): Promise<Alert> {
    // Convert CreateAlertDto to a JSON string
    const alertDataString = createAlertDto.replace(/\\"/g, '"');
    // const cleanedJsonString = createAlertDto.replace(/\\"/g, '"');

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

  async getFilteredAlerts(bullOrBear: string, tf: string): Promise<Alert[]> {
    // Use TypeORM's query builder for efficient filtering
    const qb = this.alertRepository
      .createQueryBuilder('alert')
      .where("alert.alert_data::json->>'alert' ILIKE :bullOrBear", {
        bullOrBear: `%${bullOrBear}%`,
      })
      .andWhere("alert.alert_data::json->>'tf' = :tf", { tf });

    return await qb.getMany();
  }
}
