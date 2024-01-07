import { PartialType } from '@nestjs/mapped-types';
import { CreateCoinmarketcapDto } from './create-coinmarketcap.dto';

export class UpdateCoinmarketcapDto extends PartialType(CreateCoinmarketcapDto) {}
