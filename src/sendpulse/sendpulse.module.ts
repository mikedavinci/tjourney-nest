import { Module } from '@nestjs/common';
import { SendpulseService } from './sendpulse.service';
import { SendpulseController } from './sendpulse.controller';

@Module({
  controllers: [SendpulseController],
  providers: [SendpulseService],
})
export class SendpulseModule {}
