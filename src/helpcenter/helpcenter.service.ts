import { Injectable } from '@nestjs/common';
import { CreateHelpcenterDto } from './dto/create-helpcenter.dto';
import { UpdateHelpcenterDto } from './dto/update-helpcenter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Helpcenter } from './entities/helpcenter.entity';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class HelpcenterService {
  constructor(
    @InjectRepository(Helpcenter)
    private readonly affiliatePartnerRepository: Repository<Helpcenter>,
    private readonly mailService: MailService
  ) {}

  async create(
    createHelpcenterDto: CreateHelpcenterDto
  ): Promise<{ statusCode: number; message: string }> {
    try {
      const helpcenter =
        this.affiliatePartnerRepository.create(createHelpcenterDto);
      // console.log('Created Helpcenter:', helpcenter); // Debug log

      await this.affiliatePartnerRepository.save(helpcenter);
      await this.mailService.sendHelpcenterEmail();

      return {
        statusCode: 201,
        message:
          'Your help ticket has been submitted successfully! We will review it and get back to you soon.',
      };
    } catch (error) {
      console.error('Error saving helpcenter:', error); // Error log
      return {
        statusCode: 500,
        message:
          'Internal Server Error. Please try again later or contact support@pilotwizard.ai',
      };
    }
  }
}
