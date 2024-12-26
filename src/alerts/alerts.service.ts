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

  private processExitSignal(
    alert: string,
    ohlcv: any
  ): {
    isExit: boolean;
    exitType: 'bullish' | 'bearish' | null;
    baseSignal: string;
    tp1?: number;
  } {
    // Check for both formats of exit signals
    const isExitBearish =
      alert.includes('ExitsBearish Exit') ||
      alert.includes('Exits Bearish Exit');
    const isExitBullish =
      alert.includes('ExitsBullish Exit') ||
      alert.includes('Exits Bullish Exit');
    const isExit = isExitBearish || isExitBullish;

    let exitType = null;
    let tp1 = null;
    let baseSignal = '';

    // Process based on exit type
    if (isExitBearish) {
      exitType = 'bearish';
      tp1 = ohlcv.close; // Set take profit to current close for SELL exits
      baseSignal = 'Exits Bearish Exit';
      console.log('Processing Bearish Exit Signal - Setting tp1 to:', tp1);
    }
    if (isExitBullish) {
      exitType = 'bullish';
      tp1 = ohlcv.close; // Set take profit to current close for BUY exits
      baseSignal = 'Exits Bullish Exit';
      console.log('Processing Bullish Exit Signal - Setting tp1 to:', tp1);
    } 

    console.log('Exit Signal Processing:', {
      originalAlert: alert,
      isExit,
      exitType,
      baseSignal,
      tp1,
      close: ohlcv?.close,
    });

    return { isExit, exitType, baseSignal, tp1 };
  }

  async saveAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    // Process the exit signal
    const { isExit, exitType, baseSignal, tp1 } = this.processExitSignal(
      createAlertDto.alert,
      createAlertDto.ohlcv
    );

    // Create alert with additional exit information
    const alert = this.alertRepository.create({
      ...createAlertDto,
      alert: baseSignal,
      isExit,
      exitType,
      tp1, // Add tp1 from exit signal
      isStocksAlert: false,
      isForexAlert: false,
    });

    console.log('Saving alert with exit information:', {
      baseSignal,
      isExit,
      exitType,
      tp1,
      ticker: alert.ticker,
      tf: alert.tf,
    });

    return await this.alertRepository.save(alert);
  }

  async saveForexAlertData(createAlertDto: CreateAlertDto): Promise<Alert> {
    // Process the exit signal for forex alerts
    const { isExit, exitType, baseSignal, tp1 } = this.processExitSignal(
      createAlertDto.alert,
      createAlertDto.ohlcv
    );

    // Create forex alert with exit information
    const alert = this.alertRepository.create({
      ...createAlertDto,
      alert: baseSignal,
      isExit,
      exitType,
      tp1, // Add tp1 from exit signal
      isStocksAlert: false,
      isForexAlert: true,
    });

    console.log('Saving forex alert with exit information:', {
      baseSignal,
      isExit,
      exitType,
      tp1,
      ticker: alert.ticker,
      tf: alert.tf,
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
      const latestAlert = await this.alertRepository
        .createQueryBuilder('alert')
        .where('alert.ticker = :pair', { pair })
        .andWhere('alert.tf = :timeframe', { timeframe })
        .orderBy('alert.bartime', 'DESC')
        .getOne();

      if (latestAlert) {
        // Extract the pattern from the alert
        const { action, pattern } = this.parseAlertSignal(latestAlert.alert);

        // Use tp1 from exit signal if available, otherwise use tp2
        const takeProfit = latestAlert.tp1 ?? latestAlert.tp2;

        const signal: MT4SignalResponseDto = {
          ticker: pair,
          action: action,
          price: latestAlert.ohlcv.close,
          timestamp: moment(Number(latestAlert.bartime)).format(
            'MM/DD/YYYY hh:mm:ss A'
          ),
          stopLoss: latestAlert.sl2,
          takeProfit: takeProfit,
          sl1: latestAlert.sl1,
          sl2: latestAlert.sl2,
          tp1: latestAlert.tp1,
          tp2: latestAlert.tp2,
          signalPattern: pattern,
          ohlcv: latestAlert.ohlcv,
          timeframe: latestAlert.tf,
          isExit: latestAlert.isExit,
          exitType: latestAlert.exitType,
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

  async saveLuxAlgoAlert(
    luxAlgoAlertDto: LuxAlgoAlertDto
  ): Promise<LuxAlgoAlert> {
    try {
      console.log(' Processing LuxAlgo alert with data:', luxAlgoAlertDto);

      if (!this.luxAlgoRepository) {
        console.error(' LuxAlgoRepository is not initialized!');
        throw new Error('Repository not initialized');
      }

      // Create alert with flexible data
      const alert = this.luxAlgoRepository.create({
        alert_data: luxAlgoAlertDto.alert_data,
        ticker: luxAlgoAlertDto.ticker || 'UNKNOWN',
        tf: luxAlgoAlertDto.tf || '240',
        bartime: luxAlgoAlertDto.bartime || Date.now(),
      });

      console.log(' Created alert entity:', {
        ticker: alert.ticker,
        tf: alert.tf,
        bartime: alert.bartime,
      });

      const savedAlert = await this.luxAlgoRepository.save(alert);
      console.log(' Saved alert to database:', {
        id: savedAlert.id,
        ticker: savedAlert.ticker,
        tf: savedAlert.tf,
        bartime: savedAlert.bartime,
        alert_type: savedAlert.alert_data?.alert,
      });

      return savedAlert;
    } catch (error) {
      console.error(' Error in saveLuxAlgoAlert:', error);
      throw error;
    }
  }

  async getLatestLuxAlgoAlert(
    ticker: string,
    timeframe?: string
  ): Promise<LuxAlgoAlert> {
    try {
      console.log(' Fetching latest LuxAlgo alert for:', {
        ticker,
        timeframe: timeframe || 'any',
      });

      if (!this.luxAlgoRepository) {
        console.error(' LuxAlgoRepository is not initialized!');
        throw new Error('Repository not initialized');
      }

      const queryBuilder = this.luxAlgoRepository
        .createQueryBuilder('luxalgo')
        .where('luxalgo.ticker = :ticker', { ticker })
        .orderBy('luxalgo.bartime', 'DESC')
        .take(1);

      if (timeframe) {
        queryBuilder.andWhere('luxalgo.tf = :timeframe', { timeframe });
      }

      console.log(' Executing query:', queryBuilder.getSql());
      console.log('Query parameters:', { ticker, timeframe });

      const alert = await queryBuilder.getOne();

      if (!alert) {
        console.log(' No alert found for:', { ticker, timeframe });
        throw new NotFoundException(
          `No LuxAlgo alert found for ticker ${ticker}`
        );
      }

      console.log(' Found alert:', {
        id: alert.id,
        ticker: alert.ticker,
        tf: alert.tf,
        bartime: alert.bartime,
        alert_type: alert.alert_data?.alert,
      });

      return alert;
    } catch (error) {
      console.error(' Error in getLatestLuxAlgoAlert:', error);
      throw error;
    }
  }

  async getLuxAlgoAlerts(
    page: number = 1,
    limit: number = 10,
    ticker?: string,
    timeframe?: string
  ): Promise<{ alerts: LuxAlgoAlert[]; total: number }> {
    try {
      console.log(' Fetching LuxAlgo alerts with params:', {
        page,
        limit,
        ticker: ticker || 'all',
        timeframe: timeframe || 'all',
      });

      if (!this.luxAlgoRepository) {
        console.error(' LuxAlgoRepository is not initialized!');
        throw new Error('Repository not initialized');
      }

      const queryBuilder = this.luxAlgoRepository
        .createQueryBuilder('luxalgo')
        .orderBy('luxalgo.bartime', 'DESC');

      if (ticker) {
        queryBuilder.andWhere('luxalgo.ticker = :ticker', { ticker });
      }

      if (timeframe) {
        queryBuilder.andWhere('luxalgo.tf = :timeframe', { timeframe });
      }

      console.log(' Executing query:', queryBuilder.getSql());
      console.log('Query parameters:', { page, limit, ticker, timeframe });

      const [alerts, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      console.log(' Query results:', {
        found: alerts.length,
        total,
        first_alert: alerts[0]
          ? {
              id: alerts[0].id,
              ticker: alerts[0].ticker,
              tf: alerts[0].tf,
              bartime: alerts[0].bartime,
            }
          : null,
      });

      return { alerts, total };
    } catch (error) {
      console.error(' Error in getLuxAlgoAlerts:', error);
      throw error;
    }
  }
}