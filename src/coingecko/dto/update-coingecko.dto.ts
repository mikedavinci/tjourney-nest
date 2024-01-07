import { PartialType } from '@nestjs/mapped-types';
import { CreateCoingeckoDto } from './create-coingecko.dto';

export class UpdateCoingeckoDto extends PartialType(CreateCoingeckoDto) {}
