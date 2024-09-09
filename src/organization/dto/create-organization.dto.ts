// create-organization.dto.ts
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  organizationName: string;

  @IsOptional()
  organizationType: string;

  @IsOptional()
  organizationSize: string;

  @IsOptional()
  targetAudience: string;

  @IsOptional()
  challenges: string;

  @IsOptional()
  previousStrategy: string;

  @IsOptional()
  objectives: string;

  @IsOptional()
  mainCompetitors: string;

  @IsOptional()
  typicalCustomerJourney: string;

  @IsOptional()
  brandPersonality: string;

  @IsOptional()
  brandValues: string;

  @IsOptional()
  userExperience: string;

  @IsOptional()
  facebook_url: string;

  @IsOptional()
  twitter_url: string;

  @IsOptional()
  instagram_url: string;

  @IsOptional()
  linkedin_url: string;

  @IsOptional()
  youtube_url: string;

  @IsOptional()
  whatsapp: string;

  @IsOptional()
  website_url: string;

  @IsOptional()
  logo: string;
}
