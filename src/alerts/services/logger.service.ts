import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as Papertrail from 'winston-papertrail';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const papertrailTransport = new Papertrail.Papertrail({
      host: 'logs.papertrailapp.com',
      port: 26548,
      hostname: 'EA-tjourney',
      level: 'info',
      logFormat: function (level, message) {
        return '[' + level + '] ' + message;
      },
    });

    this.logger = winston.createLogger({
      transports: [papertrailTransport],
    });
  }

  log(message: string, metadata?: any) {
    this.logger.info(message, metadata);
  }

  error(message: string, metadata?: any) {
    this.logger.error(message, metadata);
  }

  warn(message: string, metadata?: any) {
    this.logger.warn(message, metadata);
  }

  console(message: string, metadata?: any) {
    console.log(message, metadata);
  }
}
