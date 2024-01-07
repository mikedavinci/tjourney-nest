import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoingeckoService } from './coingecko.service';
import { CreateCoingeckoDto } from './dto/create-coingecko.dto';
import { UpdateCoingeckoDto } from './dto/update-coingecko.dto';

@Controller('coingecko')
export class CoingeckoController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @Post()
  create(@Body() createCoingeckoDto: CreateCoingeckoDto) {
    return this.coingeckoService.create(createCoingeckoDto);
  }

  @Get()
  findAll() {
    return this.coingeckoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coingeckoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoingeckoDto: UpdateCoingeckoDto) {
    return this.coingeckoService.update(+id, updateCoingeckoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coingeckoService.remove(+id);
  }
}
