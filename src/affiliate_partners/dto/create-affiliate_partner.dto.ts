import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateAffiliatePartnerDto {
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

  @IsString()
  @IsOptional()
  affiliateCode?: string;

  // @IsString()
  // @IsOptional()
  // linkedInProfile?: string;

  // @IsOptional()
  // resume?: Buffer;
}
