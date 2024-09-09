import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinmarketcapService } from './coinmarketcap.service';
import { CoinmarketcapController } from './coinmarketcap.controller';
import { CoinGeckoSearch } from 'src/coingecko/entities/coingecko.entity';
import { TwelveDataLogo } from 'src/twelvedata/entities/twelve-data-logo.entity';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { SimplePrice } from 'src/coingecko/entities/simple-price.entity';
import { CoinOHLC } from 'src/coingecko/entities/coin-ohlc.entity';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CoinGeckoSearch,
      CoinOHLC,
      SimplePrice,
      TwelveDataLogo,
    ]),
    CoingeckoModule, // Ensure this module is imported
  ],
  controllers: [CoinmarketcapController],
  providers: [CoinmarketcapService, CoinGeckoService],
  exports: [CoinmarketcapService, CoinGeckoService],
})
export class CoinmarketcapModule {}
