import { Module } from '@nestjs/common';
import { CoinGeckoController } from './coingecko.controller';
import { CoinGeckoService } from './coingecko.service';
import { Token } from './entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  controllers: [CoinGeckoController],
  providers: [CoinGeckoService],
})
export class CoingeckoModule {}
