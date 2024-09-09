import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStripeProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  subscription: boolean;

  @IsOptional()
  @IsNumber()
  price_per_month: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  stripe_product_id?: string;

  @IsOptional()
  @IsString()
  stripe_price_id?: string;

  @IsOptional()
  @IsString()
  payment_method_types?: string;

  @IsOptional()
  @IsString()
  tax_code?: string;
}
