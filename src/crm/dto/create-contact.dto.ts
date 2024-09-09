import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactStatus } from '../entities/contact-status.entity';

export class CreateContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;
}
