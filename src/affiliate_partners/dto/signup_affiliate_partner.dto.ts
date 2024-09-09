import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class AffiliatePartnerSignupDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsOptional()
  @IsUrl()
  website: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  promotionalMaterials: string;

  // Add any other necessary properties for affiliate partner signup
}
