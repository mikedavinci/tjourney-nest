import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HelpcenterService } from './helpcenter.service';
import { CreateHelpcenterDto } from './dto/create-helpcenter.dto';
import { UpdateHelpcenterDto } from './dto/update-helpcenter.dto';

@Controller('helpcenter')
export class HelpcenterController {
  constructor(private readonly helpcenterService: HelpcenterService) {}

  @Post('help-me')
  async create(
    @Body() createHelpcenterDto: CreateHelpcenterDto
  ): Promise<{ statusCode: number; message: string }> {
    return this.helpcenterService.create(createHelpcenterDto);
  }
}
