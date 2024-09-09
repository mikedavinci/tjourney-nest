import { Module } from '@nestjs/common';
import { AffiliatePartner } from './entities/affiliate_partner.entity';
import { MailModule } from 'src/mail/mail.module';
import { AffiliatePartnerController } from './affiliate_partners.controller';
import { AffiliatePartnerService } from './affiliate_partners.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AffiliatePartner]), MailModule],
  controllers: [AffiliatePartnerController],
  providers: [AffiliatePartnerService],
})
export class AffiliatePartnersModule {}
