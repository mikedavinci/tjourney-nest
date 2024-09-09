import { Module } from '@nestjs/common';
import { TwelvedataController } from './twelvedata.controller';
import { TwelveDataService } from './twelvedata.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwelveDataSymbolSearch } from './entities/twelvedatum.entity';
import { TwelveDataLogo } from './entities/twelve-data-logo.entity';
import { TwelveDataQuote } from './entities/twelve-data-quote.entity';
import { TimeSeriesCache } from './entities/time-series-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwelveDataSymbolSearch,
      TwelveDataLogo,
      TwelveDataQuote,
      TimeSeriesCache,
    ]),
  ],
  controllers: [TwelvedataController],
  providers: [TwelveDataService],
})
export class TwelvedataModule {}
