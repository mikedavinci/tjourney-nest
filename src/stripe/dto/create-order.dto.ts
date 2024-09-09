import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsString()
  client_reference_id?: string;

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  customer_email?: string;

  @IsOptional()
  @IsString()
  invoice?: string;

  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsNumber()
  amount_subtotal?: number;

  @IsOptional()
  @IsNumber()
  amount_total?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  subscription?: string;

  @IsOptional()
  @IsObject()
  total_details?: object;

  @IsOptional()
  @IsNumber()
  amount_discount?: number;
}
