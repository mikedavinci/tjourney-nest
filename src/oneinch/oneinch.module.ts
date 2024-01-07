import { Module } from '@nestjs/common';
import { OneinchService } from './oneinch.service';
import { OneinchController } from './oneinch.controller';

@Module({
  controllers: [OneinchController],
  providers: [OneinchService],
})
export class OneinchModule {}
