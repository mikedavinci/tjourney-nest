// create-career.dto.ts

import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateCareerDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsOptional()
  linkedInProfile?: string;

  @IsString()
  @IsOptional()
  hearAboutUs?: string;

  @IsOptional()
  resume?: Buffer;
}
