// polygon.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PolygonController } from './polygon.controller';
import { PolygonService } from './polygon.service';
import { PolygonWebsocketService } from './polygon-websocket.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PolygonController],
  providers: [PolygonService, PolygonWebsocketService],
  exports: [PolygonWebsocketService, PolygonWebsocketService],
})
export class PolygonModule {}
