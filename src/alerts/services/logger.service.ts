// src/alerts/services/logger.service.ts
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
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    });
  }

  // Trading specific logging methods
  logTradeCheck(symbol: string, data: any) {
    this.logger.info(`[TRADE_CHECK][${symbol}] New trading cycle started`, {
      symbol,
      type: 'TRADE_CHECK',
      ...data,
    });
  }

  logTradeSignal(symbol: string, signal: any) {
    this.logger.info(`[SIGNAL][${symbol}] New trading signal detected`, {
      symbol,
      type: 'TRADE_SIGNAL',
      signal,
      timestamp: new Date().toISOString(),
    });
  }

  logTradeExecution(symbol: string, orderDetails: any) {
    this.logger.info(`[TRADE_EXEC][${symbol}] Trade executed`, {
      symbol,
      type: 'TRADE_EXECUTION',
      ...orderDetails,
      executionTime: new Date().toISOString(),
    });
  }

  logTradeSkip(symbol: string, reason: string, details?: any) {
    this.logger.info(`[TRADE_SKIP][${symbol}] Trade skipped: ${reason}`, {
      symbol,
      type: 'TRADE_SKIP',
      reason,
      ...details,
    });
  }

  logPositionUpdate(symbol: string, position: any) {
    this.logger.info(`[POSITION][${symbol}] Position updated`, {
      symbol,
      type: 'POSITION_UPDATE',
      ...position,
      updateTime: new Date().toISOString(),
    });
  }

  logBalanceUpdate(balanceInfo: any) {
    this.logger.info(`[BALANCE] Account balance updated`, {
      type: 'BALANCE_UPDATE',
      ...balanceInfo,
      updateTime: new Date().toISOString(),
    });
  }

  // Original general logging methods
  log(message: string, metadata?: any) {
    this.logger.info(message, {
      type: 'INFO',
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  error(message: string, metadata?: any) {
    this.logger.error(message, {
      type: 'ERROR',
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: string, metadata?: any) {
    this.logger.warn(message, {
      type: 'WARNING',
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  // API call logging
  logAPICall(method: string, endpoint: string, metadata?: any) {
    this.logger.info(`[API] ${method} ${endpoint}`, {
      type: 'API_CALL',
      method,
      endpoint,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  logAPIResponse(
    method: string,
    endpoint: string,
    status: number,
    metadata?: any
  ) {
    this.logger.info(`[API] Response ${method} ${endpoint}: ${status}`, {
      type: 'API_RESPONSE',
      method,
      endpoint,
      status,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  // Risk management logging
  logRiskCheck(
    symbol: string,
    checkType: string,
    result: boolean,
    details?: any
  ) {
    this.logger.info(`[RISK][${symbol}] ${checkType}: ${result}`, {
      type: 'RISK_CHECK',
      symbol,
      checkType,
      result,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }

  console(message: string, metadata?: any) {
    console.log(message, metadata);
  }
}
