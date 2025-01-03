import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './alerts.service';
import { AlertController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { AlertRepository } from './entities/alert.repository';
import { LuxAlgoAlert } from './entities/luxalgo.entity';
import { LuxAlgoRepository } from './entities/luxalgo.repository';
import { LoggerService } from './services/logger.service';
import { CoinbaseService } from './coinbase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alert,
      AlertRepository,
      LuxAlgoAlert,
      LuxAlgoRepository,
    ]),
  ],
  providers: [
    AlertService,
    AlertRepository,
    LuxAlgoRepository,
    LoggerService,
    CoinbaseService,
  ],
  controllers: [AlertController],
  exports: [AlertService, CoinbaseService],
})
export class AlertModule {}
