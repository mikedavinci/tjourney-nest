import { Injectable } from '@nestjs/common';
import { CreateOneinchDto } from './dto/create-oneinch.dto';
import { UpdateOneinchDto } from './dto/update-oneinch.dto';

@Injectable()
export class OneinchService {
  create(createOneinchDto: CreateOneinchDto) {
    return 'This action adds a new oneinch';
  }

  findAll() {
    return `This action returns all oneinch`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oneinch`;
  }

  update(id: number, updateOneinchDto: UpdateOneinchDto) {
    return `This action updates a #${id} oneinch`;
  }

  remove(id: number) {
    return `This action removes a #${id} oneinch`;
  }
}
