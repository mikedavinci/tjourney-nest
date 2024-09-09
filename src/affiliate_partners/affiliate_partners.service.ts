import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { AffiliatePartner } from './entities/affiliate_partner.entity';
import { CreateAffiliatePartnerDto } from './dto/create-affiliate_partner.dto';

@Injectable()
export class AffiliatePartnerService {
  constructor(
    @InjectRepository(AffiliatePartner)
    private readonly affiliatePartnerRepository: Repository<AffiliatePartner>,
    private readonly mailService: MailService
  ) {}

  async apply(
    createAffiliatePartnerDto: CreateAffiliatePartnerDto
  ): Promise<{ statusCode: number; message: string }> {
    try {
      const affiliatePartner = this.affiliatePartnerRepository.create(
        createAffiliatePartnerDto
      );

      await this.affiliatePartnerRepository.save(affiliatePartner);
      await this.mailService.sendAffiliatePartnerApplicationEmail();

      return {
        statusCode: 201,
        message:
          'Your application has been submitted successfully! We will review it and get back to you soon.',
      };
    } catch (error) {
      console.error('Error saving affiliate partner:', error); // Error log
      return {
        statusCode: 500,
        message:
          'Internal Server Error. Please try again later or contact support@pilotwizard.ai',
      };
    }
  }
}

// async signUp(affiliatePartnerSignupDto: AffiliatePartnerSignupDto): Promise<{
//   statusCode: number;
//   message: string;
//   data?: AffiliatePartnerSignupDto;
// }> {
//   try {
//     const user = await this.userService.create(affiliatePartnerSignupDto);

//     const affiliatePartner = await this.create(
//       affiliatePartnerSignupDto,
//       user
//     );

//     // Send email verification
//     await this.sendEmailVerification(user.email);

//     return {
//       statusCode: 201, // 201 for created
//       message: 'An email has been sent to you. Please verify your account.',
//       // data: affiliatePartnerResponse,
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       statusCode: 500, // Internal Server Error
//       message: 'Failed to create affiliate partner. Please try again.',
//     };
//   }
// }

// async create(
//   affiliatePartnerSignupDto: AffiliatePartnerSignupDto,
//   user: User
// ): Promise<AffiliatePartner> {
//   try {
//     // Check if the affiliate partner already exists
//     const existingAffiliatePartner =
//       await this.affiliatePartnerRepository.findOne({
//         where: { user: { id: user.id } },
//       });
//     if (existingAffiliatePartner) {
//       throw new ConflictException('Affiliate partner already exists');
//     }

//     // If affiliate partner does not exist, proceed with creation
//     const affiliatePartner = this.affiliatePartnerRepository.create({
//       ...affiliatePartnerSignupDto,
//       user,
//     });
//     const newAffiliatePartner =
//       await this.affiliatePartnerRepository.save(affiliatePartner);

//     await this.mailService.affiliatePartnerSignedUp(existingAffiliatePartner);
//     return newAffiliatePartner;
//   } catch (error) {
//     // Rethrow the error to be handled by NestJS's global exception filter
//     // or a controller-level exception filter.
//     throw error;
//   }
// }

// async sendEmailVerification(email: string): Promise<void> {
//   // Implement the logic to send email verification to the affiliate partner
//   // You can use the `mailService` to send the email
//   // Example: await this.mailService.sendEmailVerification(email);
// }
