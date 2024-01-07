import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alerts.entity';
import { AlertService } from './alerts.service';
import { AlertController } from './alerts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  providers: [AlertService],
  controllers: [AlertController],
})
export class AlertModule {}
