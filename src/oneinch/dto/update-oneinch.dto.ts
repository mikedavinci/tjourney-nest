import { PartialType } from '@nestjs/mapped-types';
import { CreateOneinchDto } from './create-oneinch.dto';

export class UpdateOneinchDto extends PartialType(CreateOneinchDto) {}
