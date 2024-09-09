import { PartialType } from '@nestjs/swagger';
import { CreateTwelvedatumDto } from './create-twelvedatum.dto';

export class UpdateTwelvedatumDto extends PartialType(CreateTwelvedatumDto) {}
