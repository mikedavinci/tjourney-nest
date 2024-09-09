import { Body, Controller, Post } from '@nestjs/common';
import { ContactUsService } from './contact_us.service';
import { CreateContactUsDto } from './dto/create-contact_us.dto';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post('submit')
  async create(
    @Body() createContactUsDto: CreateContactUsDto
  ): Promise<{ statusCode: number; message: string }> {
    return this.contactUsService.create(createContactUsDto);
  }
}
