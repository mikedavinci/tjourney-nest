import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class UserNewOnboardDto {
  @IsString()
  name?: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsArray()
  @IsOptional()
  objectives?: string[];

  @IsString()
  @IsOptional()
  affiliateCode?: string;

  @IsBoolean()
  agreedTOSPrivacy: boolean;
}
