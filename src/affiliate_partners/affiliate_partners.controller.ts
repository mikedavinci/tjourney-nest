import { Body, Controller, Post } from '@nestjs/common';
import { AffiliatePartnerSignupDto } from './dto/signup_affiliate_partner.dto';
import { AffiliatePartnerService } from './affiliate_partners.service';
import { CreateAffiliatePartnerDto } from './dto/create-affiliate_partner.dto';

@Controller('affiliate-partner')
export class AffiliatePartnerController {
  constructor(
    private readonly affiliatePartnerService: AffiliatePartnerService
  ) {}

  @Post('apply')
  async apply(
    @Body() createAffiliatePartnerDto: CreateAffiliatePartnerDto
  ): Promise<{ statusCode: number; message: string }> {
    return this.affiliatePartnerService.apply(createAffiliatePartnerDto);
  }
}

// @Post('/sign-up')
// signUp(
//   @Body() affiliatePartnerSignupDto: AffiliatePartnerSignupDto
// ): Promise<{
//   statusCode: number;
//   message: string;
//   data?: AffiliatePartnerSignupDto;
// }> {
//   return this.affiliatePartnerService.signUp(affiliatePartnerSignupDto);
// }
