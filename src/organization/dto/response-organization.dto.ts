import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Organization } from 'src/organization/entities/organization.entity';

export class OrganizationResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  organizationName: string;

  @IsString()
  organizationType: string;

  @IsString()
  organizationSize: string;

  @IsString()
  challenges: string;

  @IsString()
  previousStrategy: string;

  @IsString()
  objectives: string;

  @IsString()
  mainCompetitors: string;

  @IsString()
  typicalCustomerJourney: string;

  @IsString()
  brandValues: string;

  @IsString()
  userExperience: string;

  @IsString()
  facebook_url: string;

  @IsString()
  twitter_url: string;

  @IsString()
  instagram_url: string;

  @IsString()
  linkedin_url: string;

  @IsString()
  youtube_url: string;

  @IsString()
  whatsapp: string;

  @IsString()
  website_url: string;
}
