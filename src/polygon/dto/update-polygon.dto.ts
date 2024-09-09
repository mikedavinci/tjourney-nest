import { PartialType } from '@nestjs/swagger';
import { CreatePolygonDto } from './create-polygon.dto';

export class UpdatePolygonDto extends PartialType(CreatePolygonDto) {}
