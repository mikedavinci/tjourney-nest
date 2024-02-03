import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OneinchService } from './oneinch.service';
import { CreateOneinchDto } from './dto/create-oneinch.dto';
import { UpdateOneinchDto } from './dto/update-oneinch.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Oneinch')
@Controller('oneinch')
export class OneinchController {
  constructor(private readonly oneinchService: OneinchService) {}

  @Post()
  create(@Body() createOneinchDto: CreateOneinchDto) {
    return this.oneinchService.create(createOneinchDto);
  }

  @Get()
  findAll() {
    return this.oneinchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.oneinchService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOneinchDto: UpdateOneinchDto) {
    return this.oneinchService.update(+id, updateOneinchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oneinchService.remove(+id);
  }
}
