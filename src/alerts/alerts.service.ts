// Service
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import * as moment from 'moment';
import { AlertRepository } from './entities/alert.repository';
import { MT4SignalResponseDto } from './dto/mt4-signal.dto';
import { LuxAlgoAlert } from './entities/luxalgo.entity';
import { LuxAlgoRepository } from './entities/luxalgo.repository';
import { LuxAlgoAlertDto } from './dto/luxalgo-alert.dto';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(AlertRepository)
    private alertRepository: AlertRepository,
    @InjectRepository(LuxAlgoRepository)
    private luxAlgoRepository: LuxAlgoRepository
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
        .andWhere('alert.tf = :timeframe', { timeframe })
        .orderBy('alert.bartime', 'DESC')
        .getOne();

      if (latestAlert) {
        console.log('Found latest alert for pair:', pair);
        console.log('OHLCV data:', JSON.stringify(latestAlert.ohlcv, null, 2));

        // Check if take profit values exist
        const tp1 = latestAlert.tp1 ?? undefined;
        const tp2 = latestAlert.tp2 ?? undefined;
        const sl1 = latestAlert.sl1 ?? undefined;
        const sl2 = latestAlert.sl2 ?? undefined;

        console.log('Take Profit values:', {
          tp1: tp1 !== undefined ? tp1 : 'not available',
          tp2: tp2 !== undefined ? tp2 : 'not available',
        });
        console.log('Stop Loss values:', {
          sl1: sl1 !== undefined ? sl1 : 'not available',
          sl2: sl2 !== undefined ? sl2 : 'not available',
        });

        // Extract the pattern from the alert
        const { action, pattern } = this.parseAlertSignal(latestAlert.alert);
        const isBearish = action === 'SELL';

        console.log('Signal action:', action);
        console.log('Pattern:', pattern);

        const signal: MT4SignalResponseDto = {
          ticker: pair,
          action: action,
          price: latestAlert.ohlcv.close,
          timestamp: moment(Number(latestAlert.bartime)).format(
            'MM/DD/YYYY hh:mm:ss A'
          ),
          stopLoss: sl1,
          takeProfit: tp1,
          sl1,
          sl2,
          tp1,
          tp2,
          signalPattern: pattern,
          ohlcv: latestAlert.ohlcv,
          timeframe: latestAlert.tf,
        };

        console.log('Generated signal:', JSON.stringify(signal, null, 2));
        signals.push(signal);
      } else {
        console.log('No alert found for pair:', pair);
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

  async saveLuxAlgoAlert(
    luxAlgoAlertDto: LuxAlgoAlertDto
  ): Promise<LuxAlgoAlert> {
    console.log('LuxAlgo Repository:', this.luxAlgoRepository);
    console.log('Attempting to save LuxAlgo alert with data:', luxAlgoAlertDto);

    try {
      const alert = this.luxAlgoRepository.create({
        ...luxAlgoAlertDto,
      });
      console.log('Created alert entity:', alert);

      const savedAlert = await this.luxAlgoRepository.save(alert);
      console.log('Saved alert:', savedAlert);
      return savedAlert;
    } catch (error) {
      console.error('Error in saveLuxAlgoAlert:', error);
      throw error;
    }
  }

  async getLatestLuxAlgoAlert(
    ticker: string,
    timeframe?: string
  ): Promise<LuxAlgoAlert> {
    console.log('Getting latest LuxAlgo alert for:', { ticker, timeframe });
    try {
      const queryBuilder = this.luxAlgoRepository
        .createQueryBuilder('luxalgo')
        .where('luxalgo.ticker = :ticker', { ticker })
        .orderBy('luxalgo.bartime', 'DESC')
        .take(1);

      if (timeframe) {
        queryBuilder.andWhere('luxalgo.tf = :timeframe', { timeframe });
      }

      console.log('Query:', queryBuilder.getSql());
      const alert = await queryBuilder.getOne();
      console.log('Found alert:', alert);

      if (!alert) {
        throw new NotFoundException(
          `No LuxAlgo alert found for ticker ${ticker}`
        );
      }

      return alert;
    } catch (error) {
      console.error('Error in getLatestLuxAlgoAlert:', error);
      throw error;
    }
  }

  async getLuxAlgoAlerts(
    page: number = 1,
    limit: number = 10,
    ticker?: string,
    timeframe?: string
  ): Promise<{ alerts: LuxAlgoAlert[]; total: number }> {
    console.log('Getting LuxAlgo alerts with params:', { page, limit, ticker, timeframe });
    try {
      const queryBuilder = this.luxAlgoRepository
        .createQueryBuilder('luxalgo')
        .orderBy('luxalgo.bartime', 'DESC');

      if (ticker) {
        queryBuilder.andWhere('luxalgo.ticker = :ticker', { ticker });
      }

      if (timeframe) {
        queryBuilder.andWhere('luxalgo.tf = :timeframe', { timeframe });
      }

      console.log('Query:', queryBuilder.getSql());
      const [alerts, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      console.log('Found alerts:', { count: alerts.length, total });
      return { alerts, total };
    } catch (error) {
      console.error('Error in getLuxAlgoAlerts:', error);
      throw error;
    }
  }
}