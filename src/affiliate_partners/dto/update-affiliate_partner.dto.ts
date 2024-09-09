import { PartialType } from '@nestjs/swagger';
import { CreateAffiliatePartnerDto } from './create-affiliate_partner.dto';
import { AffiliatePartnerSignupDto } from './signup_affiliate_partner.dto';

export class UpdateAffiliatePartnerDto extends PartialType(
  AffiliatePartnerSignupDto
) {}
