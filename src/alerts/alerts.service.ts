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
    const alert = this.alertRepository.create({
      alert_data: createAlertDto,
    });

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
