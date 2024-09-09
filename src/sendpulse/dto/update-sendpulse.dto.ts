import { PartialType } from '@nestjs/swagger';
import { CreateSendpulseDto } from './create-sendpulse.dto';

export class UpdateSendpulseDto extends PartialType(CreateSendpulseDto) {}
