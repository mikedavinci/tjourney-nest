import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './alerts.service';
import { AlertController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { AlertRepository } from './entities/alert.repository';
import { LuxAlgoAlert } from './entities/luxalgo.entity';
import { LuxAlgoRepository } from './entities/luxalgo.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, LuxAlgoAlert])],
  providers: [AlertService, AlertRepository, LuxAlgoRepository],
  controllers: [AlertController],
})
export class AlertModule {}
