import { PartialType } from '@nestjs/swagger';
import { CreateContactUsDto } from './create-contact_us.dto';

export class UpdateContactUsDto extends PartialType(CreateContactUsDto) {}
