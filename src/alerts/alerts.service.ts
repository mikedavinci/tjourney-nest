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

  async getAlertById(id: number): Promise<Alert> {
    return await this.alertRepository.findOne({ where: { id } });
  }

  async getFilteredAlerts(
    tf?: string,
    // alertType?: string,
    // createdAt?: string,
  ): Promise<Alert[]> {
    const query = this.alertRepository.createQueryBuilder('alert');

    if (tf) {
      query.andWhere("alert.alert_data ->> 'tf' ILIKE :tf", { tf: `tf%` });
    }
    // if (alertType) {
    //   query.andWhere("alert.alert_data ->> 'alert' ILIKE :alertType", {
    //     alertType: `%${alertType}%`,
    //   });
    // }
    // if (createdAt) {
    //   // Ensure createdAt is in a format compatible with PostgreSQL timestamp with time zone
    //   const createdAtDate = new Date(createdAt);
    //   query.andWhere('alert.createdAt >= :createdAt', {
    //     createdAt: createdAtDate.toISOString(),
    //   });
    // }

    return await query.getMany();
  }
}
