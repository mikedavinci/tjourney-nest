import { IsEmail, IsNumber, IsString } from 'class-validator';

export class UserResponseDto {
  @IsNumber()
  id: number;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  displayName: string;

  @IsString()
  name: string;

  @IsString()
  emailVerified: boolean;
}
