import { PartialType } from '@nestjs/mapped-types';
import { CoinGeckoSearchDto } from './create-coingecko.dto';

export class UpdateCoingeckoDto extends PartialType(CoinGeckoSearchDto) {}
