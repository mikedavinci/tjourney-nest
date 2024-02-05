import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetAlertsFilterDto {
  @IsOptional()
  @IsString()
  readonly tf?: string;

  @IsOptional()
  @IsString()
  readonly alertType?: string;

  @IsOptional()
  @IsDateString()
  readonly createdAt?: string;
}
