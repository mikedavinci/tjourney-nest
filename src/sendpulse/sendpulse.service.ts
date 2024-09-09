import { Injectable } from '@nestjs/common';
import { CreateSendpulseDto } from './dto/create-sendpulse.dto';
import { UpdateSendpulseDto } from './dto/update-sendpulse.dto';

@Injectable()
export class SendpulseService {
  create(createSendpulseDto: CreateSendpulseDto) {
    return 'This action adds a new sendpulse';
  }

  findAll() {
    return `This action returns all sendpulse`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sendpulse`;
  }

  update(id: number, updateSendpulseDto: UpdateSendpulseDto) {
    return `This action updates a #${id} sendpulse`;
  }

  remove(id: number) {
    return `This action removes a #${id} sendpulse`;
  }
}
