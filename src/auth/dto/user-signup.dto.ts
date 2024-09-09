import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class UserSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsBoolean()
  agreedTOSPrivacy: boolean;

  @IsString()
  @IsOptional()
  affiliateCode?: string;

  // @Field()
  // @IsString()
  // avatar: string;
}
