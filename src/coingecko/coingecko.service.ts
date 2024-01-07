import { Injectable } from '@nestjs/common';
import { CreateCoingeckoDto } from './dto/create-coingecko.dto';
import { UpdateCoingeckoDto } from './dto/update-coingecko.dto';

@Injectable()
export class CoingeckoService {
  create(createCoingeckoDto: CreateCoingeckoDto) {
    return 'This action adds a new coingecko';
  }

  findAll() {
    return `This action returns all coingecko`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coingecko`;
  }

  update(id: number, updateCoingeckoDto: UpdateCoingeckoDto) {
    return `This action updates a #${id} coingecko`;
  }

  remove(id: number) {
    return `This action removes a #${id} coingecko`;
  }
}
