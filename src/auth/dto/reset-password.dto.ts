import { Field } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  resetToken: string;

  // @IsDate()
  // resetTokenExpiry: Date;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
