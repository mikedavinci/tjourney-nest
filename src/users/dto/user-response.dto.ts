import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';

export class UserResponseDto {
  @IsNumber()
  id: number;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  displayName: string;

  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  country: string;

  @IsBoolean()
  emailVerified: boolean;

  @IsBoolean()
  isOnboarded: boolean;

  @IsBoolean()
  isProMember: boolean;

  @IsBoolean()
  tempPlanSelected: boolean;

  @IsBoolean()
  isAffiliate: boolean;

  @IsBoolean()
  isAdmin: boolean;

  @IsString()
  selectedPlan: string;

  @IsBoolean()
  flowReady: boolean;

  @IsBoolean()
  orgAssociated: boolean;
}
