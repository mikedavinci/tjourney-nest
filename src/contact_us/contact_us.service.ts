import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from './entities/contact_us.entity';
import { CreateContactUsDto } from './dto/create-contact_us.dto';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>
  ) {}

  async create(
    createContactUsDto: CreateContactUsDto
  ): Promise<{ statusCode: number; message: string }> {
    const contactUs = this.contactUsRepository.create(createContactUsDto);
    await this.contactUsRepository.save(contactUs);

    return {
      statusCode: 201,
      message:
        'Your form has submitted successfully! We will review it and get back to you soon.',
    };
  }
  catch(error) {
    return {
      statusCode: 500,
      message:
        'Internal Server Error. Please try again later or contact support@pilotwizard.ai.',
    };
  }
}
