import { IsString, Length } from 'class-validator';

export class VerifyPhoneCodeDto {
  @IsString()
  signInId: string;

  @IsString()
  @Length(6, 6)
  code: string;
}