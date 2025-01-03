// src/alerts/services/coinbase.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertRepository } from './entities/alert.repository';
import { RESTBase } from './coinbase/rest/rest-base';
import * as CommonTypes from './coinbase/rest/types/common-types';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  PreviewOrderRequest,
  PreviewOrderResponse,
} from './coinbase/rest/types/orders-types';
import {
  GetFuturesBalanceSummaryResponse,
  GetFuturesPositionResponse,
  ListFuturesPositionsResponse,
} from './coinbase/rest/types/futures-types';
import * as crypto from 'crypto';
import { COINBASE_CONFIG } from './config/coinbase.config';
import { API_PREFIX } from './coinbase/constants';
import { method } from './coinbase/rest/types/request-types';
import { formatPrivateKey } from './config/key-utils';
import {
  inspectKey,
  validateAndFormatKey,
  validateECKey,
} from './config/key-validator';
import { LoggerService } from './services/logger.service';
import { AlertController } from './alerts.controller';
import { MT4SignalResponseDto } from './dto/mt4-signal.dto';
import { Alert } from './entities/alert.entity';
import * as moment from 'moment';

@Injectable()
export class CoinbaseService {
  private readonly logger = new Logger(CoinbaseService.name);
  private client!: RESTBase;
  private tradingState: Map<string, CommonTypes.TradingState> = new Map();
  private lastCheckTime: Date = new Date();

  // Add getter method
  getLastCheckTime(): Date {
    return this.lastCheckTime;
  }

  constructor(
    @InjectRepository(AlertRepository)
    private alertRepository: AlertRepository,
    private readonly loggerService: LoggerService
  ) {
    this.initializeClient();
  }

  private async initializeClient() {
    this.logger.log('\n=== Initializing Coinbase Client ===');

    try {
      // Get and format API credentials
      const orgId = process.env.COINBASE_ORG_ID?.trim();
      const keyId = process.env.COINBASE_KEY_ID?.trim();
      const privateKey = process.env.COINBASE_PRIVATE_KEY?.trim();

      if (!orgId || !keyId || !privateKey) {
        throw new Error(
          'COINBASE_ORG_ID, COINBASE_KEY_ID, and COINBASE_PRIVATE_KEY must be set'
        );
      }

      // Format the API key as required by Coinbase
      const apiKey = `organizations/${orgId}/apiKeys/${keyId}`;

      this.logger.debug('Credentials Check:', {
        hasOrgId: !!orgId,
        hasKeyId: !!keyId,
        hasPrivateKey: !!privateKey,
        formattedApiKey: apiKey,
      });

      // Initialize REST client with correctly formatted key
      this.client = new RESTBase(apiKey, privateKey);

      // Test connection with correct endpoint
      const timeResponse = await this.client.request({
        method: method.GET,
        endpoint: '/api/v3/brokerage/time',
        isPublic: true,
      });

      this.logger.debug('Connection test successful:', timeResponse);
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<boolean> {
    try {
      this.logger.debug('Testing connection...');

      // Try the time endpoint first (public)
      const timeResponse = await this.client.request({
        method: method.GET,
        endpoint: '/api/v3/time',
        isPublic: true,
      });

      this.logger.debug('Public endpoint test successful:', timeResponse);

      // Then try an authenticated endpoint
      const accountsResponse = await this.client.request({
        method: method.GET,
        endpoint: `${API_PREFIX}/accounts`,
        isPublic: false,
      });

      this.logger.debug('Authenticated endpoint test successful:', {
        hasResponse: !!accountsResponse,
      });

      return true;
    } catch (error) {
      this.logger.error('Connection test failed:', {
        message: error.message,
        name: error.constructor.name,
        code: error.code,
        response: error.response,
      });
      return false;
    }
  }

  private async initializeTradingState() {
    try {
      // Get initial futures balance summary
      const balanceSummary = await this.getFuturesBalanceSummary();
      this.logger.debug('Retrieved balance summary');

      // Get current positions
      const positions = await this.listFuturesPositions();
      this.logger.debug('Retrieved positions');

      // Initialize state for each symbol
      ['BTC', 'ETH'].forEach((symbol) => {
        const currentPosition = positions.positions?.find(
          (pos) => pos.product_id === `${symbol}-USD`
        );

        this.tradingState.set(symbol, {
          lastTradeTime: 0,
          dailyLoss: 0,
          openPositions: currentPosition ? 1 : 0,
          currentPosition,
          lastAlert: null,
          balanceSummary,
        });
      });

      this.logger.log('Trading state initialized for all symbols');
    } catch (error) {
      this.logger.error('Failed to initialize trading state:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  public async getFuturesBalanceSummary(): Promise<CommonTypes.FCMBalanceSummary> {
    const response = await this.client.request({
      method: method.GET,
      endpoint: `${API_PREFIX}/cfm/balance_summary`,
      isPublic: false,
    });
    return response.balance_summary;
  }

  private async listFuturesPositions(): Promise<ListFuturesPositionsResponse> {
    return await this.client.request({
      method: method.GET,
      endpoint: `${API_PREFIX}/cfm/positions`,
      isPublic: false,
    });
  }

  public async getFuturesPosition(
    productId: string
  ): Promise<CommonTypes.FCMPosition | undefined> {
    const response = await this.client.request({
      method: method.GET,
      endpoint: `${API_PREFIX}/cfm/positions/${productId}`,
      isPublic: false,
    });
    return response.position;
  }

  async checkAndExecuteTrades() {
    this.lastCheckTime = new Date();

    if (!COINBASE_CONFIG.TRADING_RULES.ENABLE_TRADING) {
      this.loggerService.log('Trading is disabled in configuration');
      return;
    }

    try {
      // Get futures balance summary and check margin
      const balanceSummary = await this.getFuturesBalanceSummary();
      if (!this.checkMarginRequirements(balanceSummary)) {
        this.loggerService.warn('Insufficient margin for trading');
        return;
      }

      // Get BTC signals directly
      const signals = await this.getMT4Signals('BTCUSD', '30');
      if (!signals || signals.length === 0) {
        this.loggerService.log('No signals available for BTC');
        return;
      }

      // Get latest signal
      const latestSignal = signals[0];
      this.loggerService.log('Received signal for BTC', {
        signal: latestSignal,
      });

      // Process the signal
      await this.processCryptoSignal('BTC', latestSignal);
    } catch (error) {
      this.logger.error('Error in checkAndExecuteTrades:', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  private async processCryptoSignal(symbol: string, signal: any) {
    const config = COINBASE_CONFIG.FUTURES[symbol];
    const state = this.tradingState.get(symbol);

    try {
      // Skip if we've already processed this signal
      if (state?.lastAlert?.timestamp === signal.timestamp) {
        this.loggerService.log(`Signal already processed for ${symbol}`, {
          timestamp: signal.timestamp,
        });
        return;
      }

      // Update state with latest signal
      if (state) {
        state.lastAlert = signal;
      }

      // Check if this is an actionable signal
      const { action, isValid } = this.validateTradingSignal(signal, symbol);
      if (!isValid) {
        this.loggerService.log(`Invalid signal for ${symbol}`, {
          signal: signal,
        });
        return;
      }

      // Get current position
      const currentPosition = await this.getFuturesPosition(config.PRODUCT_ID);

      // Handle existing position if any
      if (currentPosition && Number(currentPosition.number_of_contracts) > 0) {
        const currentSide =
          currentPosition.side?.toString() === 'LONG'
            ? CommonTypes.OrderSide.BUY
            : CommonTypes.OrderSide.SELL;

        if (currentSide !== action) {
          await this.closePosition(symbol, currentPosition);
        }
      }

      // Check risk management
      if (!this.checkRiskManagement(symbol)) {
        return;
      }

      // Calculate and execute trade
      const orderParams = await this.calculateOrderParameters(
        symbol,
        action,
        signal
      );
      await this.executeTrade(orderParams);

      this.loggerService.log(`Successfully processed ${symbol} signal`, {
        action: action,
        signal: signal,
      });
    } catch (error) {
      this.loggerService.error(`Error processing ${symbol} signal:`, {
        error: error.message,
        stack: error.stack,
        signal: signal,
      });
    }
  }

  private checkMarginRequirements(
    balanceSummary: CommonTypes.FCMBalanceSummary
  ): boolean {
    // Check minimum balance
    const totalBalance = balanceSummary.total_usd_balance?.toString() || '0';
    if (
      Number(totalBalance) < COINBASE_CONFIG.RISK_MANAGEMENT.MIN_ACCOUNT_BALANCE
    ) {
      return false;
    }

    // Check if we're close to liquidation
    const liquidationBuffer = Number(
      balanceSummary.liquidation_buffer_percentage || '0'
    );
    if (liquidationBuffer < 10) {
      // Don't trade if liquidation buffer is less than 10%
      return false;
    }

    return true;
  }

  private async processCryptoAlerts(symbol: string) {
    const config = COINBASE_CONFIG.FUTURES[symbol];
    const state = this.tradingState.get(symbol);

    try {
      // Get latest alert for the symbol
      const { alerts } = await this.alertRepository.getFilteredAlerts(
        '240', // 4h timeframe
        undefined,
        undefined,
        `${symbol}USD`,
        1,
        1,
        'bartime',
        'DESC'
      );

      if (!alerts.length) {
        return;
      }

      const latestAlert = alerts[0];

      // Skip if we've already processed this alert
      if (state?.lastAlert?.bartime === latestAlert.bartime) {
        return;
      }

      // Update state with latest alert
      if (state) {
        state.lastAlert = latestAlert;
      }

      // Check if this is an actionable signal
      const { action, isValid } = this.validateTradingSignal(
        latestAlert,
        symbol
      );
      if (!isValid) {
        return;
      }

      // Get current position before trading
      const currentPosition = await this.getFuturesPosition(config.PRODUCT_ID);

      // Check if we need to close existing position first
      if (currentPosition && Number(currentPosition.number_of_contracts) > 0) {
        const currentSide =
          currentPosition.side?.toString() === 'LONG'
            ? CommonTypes.OrderSide.BUY
            : CommonTypes.OrderSide.SELL;
        if (currentSide !== action) {
          await this.closePosition(symbol, currentPosition);
        }
      }

      // Check risk management rules
      if (!this.checkRiskManagement(symbol)) {
        return;
      }

      // Calculate position size and order parameters
      const orderParams = await this.calculateOrderParameters(
        symbol,
        action,
        latestAlert
      );

      // Execute the trade
      await this.executeTrade(orderParams);

      // Update position tracking
      if (state) {
        state.openPositions = 1;
        state.currentPosition = await this.getFuturesPosition(
          config.PRODUCT_ID
        );
      }

      this.logger.log(`Successfully processed ${symbol} alert: ${action}`);
    } catch (error) {
      this.logger.error(`Error processing ${symbol} alerts:`, error);
    }
  }

  private async closePosition(
    symbol: string,
    position: CommonTypes.FCMPosition
  ) {
    const clientOrderId = `close_${symbol}_${Date.now()}_${crypto
      .randomBytes(4)
      .toString('hex')}`;

    await this.client.request({
      method: method.POST,
      endpoint: `${API_PREFIX}/orders/close_position`,
      bodyParams: {
        clientOrderId,
        productId: position.product_id,
        size: position.number_of_contracts,
      },
      isPublic: false,
    });
  }

  private validateTradingSignal(
    signal: Alert | MT4SignalResponseDto,
    symbol: string
  ): CommonTypes.TradingSignal {
    try {
      // For Alert type
      if ('bartime' in signal) {
        const alert = signal as Alert;
        return {
          action: alert.alert.includes('Bullish')
            ? CommonTypes.OrderSide.BUY
            : CommonTypes.OrderSide.SELL,
          isValid: true,
        };
      }

      // For MT4SignalResponseDto type
      const mt4Signal = signal as MT4SignalResponseDto;

      // Skip if signal is too old (more than 5 minutes)
      const signalTime = new Date(mt4Signal.timestamp).getTime();
      if (
        Date.now() - signalTime >
        COINBASE_CONFIG.TRADING_RULES.CHECK_INTERVAL
      ) {
        this.loggerService.log('Signal too old', {
          signalTime: mt4Signal.timestamp,
          currentTime: new Date().toISOString(),
        });
        return { action: null, isValid: false };
      }

      // Skip if it's an exit signal
      if (mt4Signal.isExit) {
        this.loggerService.log('Exit signal detected - skipping', {
          symbol,
          exitType: mt4Signal.exitType,
        });
        return { action: null, isValid: false };
      }

      return {
        action:
          mt4Signal.action === 'BUY'
            ? CommonTypes.OrderSide.BUY
            : CommonTypes.OrderSide.SELL,
        isValid: true,
      };
    } catch (error) {
      this.loggerService.error('Error validating signal:', error);
      return { action: null, isValid: false };
    }
  }

  private async calculateOrderParameters(
    symbol: string,
    action: CommonTypes.OrderSide,
    alert: any
  ): Promise<CreateOrderRequest> {
    const config = COINBASE_CONFIG.FUTURES[symbol];
    const clientOrderId = `${symbol}_${Date.now()}_${crypto
      .randomBytes(4)
      .toString('hex')}`;

    // Calculate position size based on risk parameters
    const state = this.tradingState.get(symbol);
    if (!state || !state.balanceSummary) {
      throw new Error('Trading state not initialized');
    }

    const totalBalance =
      state.balanceSummary.total_usd_balance?.toString() || '0';
    const accountBalance = Number(totalBalance);
    const riskPerTrade = accountBalance * (config.RISK_PER_TRADE_PERCENT / 100);

    // Calculate base position size in contracts
    const entryPrice = alert.ohlcv.close;
    const baseSize = (riskPerTrade / entryPrice).toFixed(8);

    const marketIoc: CommonTypes.MarketMarketIoc = {
      base_size: baseSize,
    };

    return {
      clientOrderId,
      productId: config.PRODUCT_ID,
      side: action,
      orderConfiguration: {
        market_market_ioc: marketIoc,
      },
      marginType: CommonTypes.MarginType.CROSS,
      leverage: config.DEFAULT_LEVERAGE.toString(),
    };
  }

  private async executeTrade(
    orderParams: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    try {
      // First preview the order
      const previewRequest: PreviewOrderRequest = {
        productId: orderParams.productId,
        side: orderParams.side,
        orderConfiguration: orderParams.orderConfiguration,
        leverage: orderParams.leverage,
        marginType: orderParams.marginType,
      };

      const preview = await this.client.request({
        method: method.POST,
        endpoint: `${API_PREFIX}/orders/preview`,
        bodyParams: previewRequest,
        isPublic: false,
      });

      if (preview.errs && preview.errs.length > 0) {
        throw new Error(
          `Order preview failed: ${JSON.stringify(preview.errs)}`
        );
      }

      // Check slippage
      const slippage = parseFloat(preview.slippage || '0');
      if (slippage > COINBASE_CONFIG.TRADING_RULES.MAX_SLIPPAGE_PERCENT) {
        throw new Error(`Slippage too high: ${slippage}%`);
      }

      // Execute the order
      const response = await this.client.request({
        method: method.POST,
        endpoint: `${API_PREFIX}/orders`,
        bodyParams: orderParams,
        isPublic: false,
      });

      if (!response.success) {
        throw new Error(
          `Order failed: ${JSON.stringify(response.response?.error_response)}`
        );
      }

      this.logger.log(
        `Trade executed successfully: ${JSON.stringify({
          productId: orderParams.productId,
          side: orderParams.side,
          clientOrderId: orderParams.clientOrderId,
        })}`
      );

      return response;
    } catch (error) {
      this.logger.error('Trade execution failed:', error);
      throw error;
    }
  }

  private checkRiskManagement(symbol: string): boolean {
    const state = this.tradingState.get(symbol);
    if (!state) return false;

    const config = COINBASE_CONFIG.RISK_MANAGEMENT;

    // Check daily loss limit
    if (state.dailyLoss > config.MAX_DAILY_LOSS_PERCENT) {
      this.logger.warn(`Daily loss limit reached for ${symbol}`);
      return false;
    }

    // Check maximum open positions
    if (state.openPositions >= config.MAX_OPEN_POSITIONS) {
      this.logger.warn(`Maximum open positions reached for ${symbol}`);
      return false;
    }

    return true;
  }

  // Utility method to reset daily stats (should be called at the start of each trading day)
  @Cron('0 0 * * *') // Run at midnight
  private async resetDailyStats() {
    try {
      // Update futures balance summary
      const balanceSummary = await this.getFuturesBalanceSummary();

      ['BTC', 'ETH'].forEach((symbol) => {
        const state = this.tradingState.get(symbol);
        if (state) {
          state.dailyLoss = 0;
          state.balanceSummary = balanceSummary;
        }
      });

      this.logger.log('Daily trading stats reset');
    } catch (error) {
      this.logger.error('Error resetting daily stats:', error);
    }
  }

  // Add method to fetch signals directly
  private async getMT4Signals(
    symbol: string,
    timeframe: string
  ): Promise<MT4SignalResponseDto[]> {
    try {
      const { alerts } = await this.alertRepository.getFilteredAlerts(
        timeframe,
        undefined,
        1,
        symbol,
        1,
        10,
        'bartime',
        'DESC'
      );

      return alerts.map((alert) => ({
        ticker: alert.ticker,
        action: alert.alert.includes('Bullish') ? 'BUY' : 'SELL',
        price: alert.ohlcv.close,
        timestamp: moment(alert.bartime).format('MM/DD/YYYY hh:mm:ss A'),
        stopLoss: alert.sl2,
        takeProfit: alert.tp2,
        sl2: alert.sl2,
        tp2: alert.tp2,
        signalPattern: alert.alert,
        ohlcv: {
          low: alert.ohlcv.low,
          high: alert.ohlcv.high,
          open: alert.ohlcv.open,
          close: alert.ohlcv.close,
          volume: alert.ohlcv.volume,
        },
        timeframe: alert.tf,
        isExit: alert.isExit || false,
        exitType: alert.exitType,
      }));
    } catch (error) {
      this.loggerService.error('Failed to fetch MT4 signals:', error);
      return [];
    }
  }
}
