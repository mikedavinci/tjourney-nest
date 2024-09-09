import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateHelpcenterDto {
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
  hearAboutUs?: string;
}
