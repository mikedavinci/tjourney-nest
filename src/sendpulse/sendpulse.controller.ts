import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SendpulseService } from './sendpulse.service';
import { CreateSendpulseDto } from './dto/create-sendpulse.dto';
import { UpdateSendpulseDto } from './dto/update-sendpulse.dto';

@Controller('sendpulse')
export class SendpulseController {
  constructor(private readonly sendpulseService: SendpulseService) {}

  @Post()
  create(@Body() createSendpulseDto: CreateSendpulseDto) {
    return this.sendpulseService.create(createSendpulseDto);
  }

  @Get()
  findAll() {
    return this.sendpulseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sendpulseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSendpulseDto: UpdateSendpulseDto) {
    return this.sendpulseService.update(+id, updateSendpulseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sendpulseService.remove(+id);
  }
}
