// Service
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import * as moment from 'moment';
import { AlertRepository } from './entities/alert.repository';
import { MT4SignalResponseDto } from './dto/mt4-signal.dto';
@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(AlertRepository)
    private alertRepository: AlertRepository
  ) {}

  async saveAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      isStocksAlert: false,
      isForexAlert: false,
    });

    return await this.alertRepository.save(alert);
  }

  async saveForexAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      isStocksAlert: false,
      isForexAlert: true,
    });

    return await this.alertRepository.save(alert);
  }

  async saveStockAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      isStocksAlert: true,
      isForexAlert: false,
    });

    return await this.alertRepository.save(alert);
  }

  async getAllAlerts(
    page: number = 1,
    limit: number
  ): Promise<{ alerts: Alert[]; total: number }> {
    try {
      return await this.alertRepository.getAllAlertsWithPagination(page, limit);
    } catch (error) {
      console.error('Error fetching all alerts:', error);
      throw error;
    }
  }

  async getFilteredAlerts(
    tf?: string,
    alertType?: string,
    daysAgo?: number,
    ticker?: string,
    page: number = 1,
    limit?: number,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ alerts: Alert[]; total: number }> {
    return await this.alertRepository.getFilteredAlerts(
      tf,
      alertType,
      daysAgo,
      ticker,
      page,
      limit,
      sortBy,
      sortOrder
    );
  }

  async getMT4Signals(
    pairs: string[],
    timeframe: string
  ): Promise<MT4SignalResponseDto[]> {
    const signals: MT4SignalResponseDto[] = [];

    for (const pair of pairs) {
      // Get the latest forex alert for each pair
      const latestAlert = await this.alertRepository
        .createQueryBuilder('alert')
        .where('alert.ticker = :pair', { pair })
        .andWhere('alert.isForexAlert = true')
        .andWhere('alert.tf = :timeframe', { timeframe })
        .orderBy('alert.bartime', 'DESC')
        .getOne();

      if (latestAlert) {
        // Extract the pattern from the alert
        const { action, pattern } = this.parseAlertSignal(latestAlert.alert);
        const isBearish = action === 'SELL';

        const signal: MT4SignalResponseDto = {
          ticker: latestAlert.ticker,
          action: action,
          price: latestAlert.ohlcv.close,
          timestamp: moment(Number(latestAlert.bartime)).format(
            'MM/DD/YYYY hh:mm:ss A'
          ),
          stopLoss: this.calculateStopLoss(latestAlert.ohlcv.close, isBearish),
          takeProfit: this.calculateTakeProfit(
            latestAlert.ohlcv.close,
            isBearish
          ),
          signalPattern: pattern,
          ohlcv: latestAlert.ohlcv,
          timeframe: latestAlert.tf,
        };

        signals.push(signal);
      }
    }

    return signals;
  }

  private parseAlertSignal(alertText: string): {
    action: 'BUY' | 'SELL' | 'NEUTRAL';
    pattern: string;
  } {
    const isBullish = alertText.includes('Bullish');
    const isBearish = alertText.includes('Bearish');

    return {
      action: isBullish ? 'BUY' : isBearish ? 'SELL' : 'NEUTRAL',
      pattern: alertText,
    };
  }

  private formatPrice(price: number): number {
    return Number(price.toFixed(5));
  }

  private calculateStopLoss(
    price: number,
    isBearish: boolean
  ): number | undefined {
    const percentage = 0.01; // 1% for Forex
    const stopLoss = isBearish
      ? price * (1 + percentage) // For bearish/SELL: 1% above entry
      : price * (1 - percentage); // For bullish/BUY: 1% below entry

    return this.formatPrice(stopLoss);
  }

  private calculateTakeProfit(
    price: number,
    isBearish: boolean
  ): number | undefined {
    const percentage = 0.02; // 2% for Forex
    const takeProfit = isBearish
      ? price * (1 - percentage) // For bearish/SELL: 2% below entry
      : price * (1 + percentage); // For bullish/BUY: 2% above entry

    return this.formatPrice(takeProfit);
  }
}