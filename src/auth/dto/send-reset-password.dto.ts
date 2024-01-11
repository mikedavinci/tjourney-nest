import { IsEmail, IsString } from 'class-validator';

export class SendResetPasswordDto {
  @IsEmail()
  @IsString()
  email: string;
}
