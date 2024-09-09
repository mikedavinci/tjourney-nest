import { Module } from '@nestjs/common';
import { RapidapiService } from './rapidapi.service';
import { RapidapiController } from './rapidapi.controller';
import { SearchStock } from './entities/rapidapi.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SearchStock])],
  controllers: [RapidapiController],
  providers: [RapidapiService],
  exports: [RapidapiService],
})
export class RapidapiModule {}
