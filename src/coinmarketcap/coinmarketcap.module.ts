import { Module } from '@nestjs/common';
import { CoinmarketcapService } from './coinmarketcap.service';
import { CoinmarketcapController } from './coinmarketcap.controller';

@Module({
  controllers: [CoinmarketcapController],
  providers: [CoinmarketcapService],
})
export class CoinmarketcapModule {}
