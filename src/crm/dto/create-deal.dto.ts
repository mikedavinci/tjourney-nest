import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DealStatus } from '../entities/deal.entity';

export class CreateDealDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @IsString()
  contactId: string;
}
