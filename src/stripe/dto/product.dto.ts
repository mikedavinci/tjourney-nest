import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductDto {
  products: { id: number; quantity: number }[];

  // @IsString()
  // name: string;

  // @IsNumber()
  // price: number;

  // @IsOptional()
  // subscription?: boolean;

  // @IsOptional()
  // @IsNumber()
  // pricePerMonth?: number;

  // @IsOptional()
  // @IsString()
  // description?: string;

  // @IsOptional()
  // @IsNumber()
  // quantity?: number;

  // @IsOptional()
  // @IsString()
  // currency: string;

  // @IsOptional()
  // @IsString()
  // payment_method_types?: string;

  // @IsOptional()
  // @IsString()
  // taxCategory?: string;
}
