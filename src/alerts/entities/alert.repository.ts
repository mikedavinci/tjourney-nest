import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository, SaveOptions } from 'typeorm';
import { Alert } from './alert.entity';
import * as moment from 'moment';

@Injectable()
export class AlertRepository extends Repository<Alert> {
  constructor(private dataSource: DataSource) {
    super(Alert, dataSource.createEntityManager());
  }

  async save<T extends DeepPartial<Alert>>(
    entity: T,
    options?: SaveOptions
  ): Promise<T> {
    try {
      console.log('Repository attempting to save alert:', {
        ticker: entity.ticker,
        tf: entity.tf,
        alert: entity.alert,
        isExit: entity.isExit,
        exitType: entity.exitType,
      });
      const savedAlert = await super.save(entity, options);
      console.log('Alert saved successfully:', savedAlert);
      return savedAlert;
    } catch (error) {
      console.error('Repository error saving alert:', error);
      throw error;
    }
  }

  async getFilteredAlerts(
    tf?: string,
    alertType?: string,
    daysAgo?: number,
    ticker?: string,
    page: number = 1,
    limit: number = 500,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    exitType?: 'bullish' | 'bearish' | null,
    isExit?: boolean
  ): Promise<{ alerts: Alert[]; total: number }> {
    const validSortColumns = [
      'createdAt',
      'updatedAt',
      'id',
      'tf',
      'ticker',
      'bartime',
    ];
    if (!validSortColumns.includes(sortBy)) {
      sortBy = 'createdAt';
    }

    const subQuery = this.createQueryBuilder('alert')
      .select('alert.id', 'id')
      .addSelect('alert.createdAt', 'createdAt')
      .addSelect('alert.ticker', 'ticker')
      .addSelect('alert.tf', 'tf')
      .addSelect('alert.alert', 'alert')
      .addSelect('alert.ohlcv', 'ohlcv')
      .addSelect('alert.bartime', 'bartime')
      .addSelect('alert.isStocksAlert', 'isStocksAlert')
      .addSelect('alert.isForexAlert', 'isForexAlert');

    if (tf) {
      subQuery.andWhere('alert.tf = :tf', { tf });
    }
    if (alertType) {
      subQuery.andWhere('alert.alert ILIKE :alertType', {
        alertType: `%${alertType}%`,
      });
    }
    if (daysAgo && daysAgo > 0) {
      const dateLimit = moment().subtract(daysAgo, 'days').toDate();
      subQuery.andWhere('alert.createdAt > :dateLimit', { dateLimit });
    }
    if (ticker) {
      subQuery.andWhere('alert.ticker = :ticker', { ticker });
    }

    subQuery.orderBy('alert.ticker').addOrderBy('alert.createdAt', 'DESC');

    const query = this.createQueryBuilder('alert')
      .innerJoin(
        `(SELECT DISTINCT ON (subq.ticker) * 
          FROM (${subQuery.getQuery()}) as subq)`,
        'latest',
        'alert.id = latest.id'
      )
      .setParameters(subQuery.getParameters())
      .orderBy(`alert.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    // Add exit signal filtering
    if (isExit !== undefined) {
      query.andWhere('alert.isExit = :isExit', { isExit });
    }

    if (exitType) {
      query.andWhere('alert.exitType = :exitType', { exitType });
    }

    // Add sorting
    if (sortBy && sortOrder) {
      query.orderBy(`alert.${sortBy}`, sortOrder);
    }

    // Add pagination
    if (limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    const [alerts, total] = await query.getManyAndCount();

    return { alerts, total };
  }

  async getAllAlertsWithPagination(
    page: number = 1,
    limit: number = 20
  ): Promise<{ alerts: Alert[]; total: number }> {
    const subQuery = this.createQueryBuilder('alert')
      .select('alert.id', 'id')
      .addSelect('alert.createdAt', 'createdAt')
      .addSelect("alert.alert_data->>'ticker'", 'ticker')
      .orderBy("alert.alert_data->>'ticker'")
      .addOrderBy('alert.createdAt', 'DESC');

    const query = this.createQueryBuilder('alert')
      .innerJoin(
        `(SELECT DISTINCT ON (subq.ticker) * 
          FROM (${subQuery.getQuery()}) as subq)`,
        'latest',
        'alert.id = latest.id'
      )
      .setParameters(subQuery.getParameters())
      .orderBy('alert.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [alerts, total] = await query.getManyAndCount();

    return { alerts, total };
  }
}
