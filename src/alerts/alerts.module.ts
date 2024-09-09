import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './alerts.service';
import { AlertController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { AlertRepository } from './entities/alert.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  providers: [AlertService, AlertRepository],
  controllers: [AlertController],
})
export class AlertModule {}
