import { IsPhoneNumber } from 'class-validator';

export class StartPhoneLoginDto {
  @IsPhoneNumber()
  phoneNumber: string;
}