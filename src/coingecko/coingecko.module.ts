import { Module } from '@nestjs/common';
import { CoinGeckoController } from './coingecko.controller';
import { CoinGeckoService } from './coingecko.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinGeckoSearch } from './entities/coingecko.entity';
import { CoinOHLC } from './entities/coin-ohlc.entity';
import { SimplePrice } from './entities/simple-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoinGeckoSearch, CoinOHLC, SimplePrice])],
  controllers: [CoinGeckoController],
  providers: [CoinGeckoService],
  exports: [CoinGeckoService],
})
export class CoingeckoModule {}
