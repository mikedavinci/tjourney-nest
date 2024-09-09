import { PartialType } from '@nestjs/swagger';
import { CreateHelpcenterDto } from './create-helpcenter.dto';

export class UpdateHelpcenterDto extends PartialType(CreateHelpcenterDto) {}
