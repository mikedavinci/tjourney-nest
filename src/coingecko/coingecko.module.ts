import { Module } from '@nestjs/common';
import { CoingeckoService } from './coingecko.service';
import { CoingeckoController } from './coingecko.controller';

@Module({
  controllers: [CoingeckoController],
  providers: [CoingeckoService],
})
export class CoingeckoModule {}
