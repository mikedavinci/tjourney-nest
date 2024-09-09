// polygon-websocket.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable()
export class PolygonWebsocketService implements OnModuleInit, OnModuleDestroy {
  private socket: Socket;
  private apiKey: string;
  public messages$: Subject<any> = new Subject();

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('POLYGON_API_KEY');
  }

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect() {
    this.socket = io('wss://socket.polygon.io/crypto', {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to Polygon WebSocket');
      this.authenticate();
    });

    this.socket.on('message', (data) => {
      this.messages$.next(data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private authenticate() {
    this.socket.emit('auth', this.apiKey);
  }

  subscribe(symbols: string[]) {
    const message = {
      action: 'subscribe',
      params: symbols.join(','),
    };
    this.socket.emit('message', JSON.stringify(message));
  }

  unsubscribe(symbols: string[]) {
    const message = {
      action: 'unsubscribe',
      params: symbols.join(','),
    };
    this.socket.emit('message', JSON.stringify(message));
  }

  private disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
