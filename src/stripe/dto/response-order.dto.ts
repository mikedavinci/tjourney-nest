import { IsString } from 'class-validator';

export class ResponseOrderDto {
  @IsString()
  session_id: string;

  @IsString()
  client_reference_id: string;

  @IsString()
  customer_id: string;

  @IsString()
  customer_email: string;
}
