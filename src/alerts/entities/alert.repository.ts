import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Alert } from './alert.entity';
import * as moment from 'moment';

@Injectable()
export class AlertRepository extends Repository<Alert> {
  constructor(private dataSource: DataSource) {
    super(Alert, dataSource.createEntityManager());
  }

  async getFilteredAlerts(
    tf?: string,
    alertType?: string,
    daysAgo?: number,
    ticker?: string,
    page: number = 1,
    limit: number = 500,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ alerts: Alert[]; total: number }> {
    const subQuery = this.createQueryBuilder('alert')
      .select('alert.id', 'id')
      .addSelect('alert.createdAt', 'createdAt')
      .addSelect("alert.alert_data->>'ticker'", 'ticker')
      .addSelect('alert.isStocksAlert', 'isStocksAlert')
      .orderBy("alert.alert_data->>'ticker'")
      .addOrderBy('alert.createdAt', 'DESC');

    if (tf) {
      subQuery.andWhere("alert.alert_data->>'tf' = :tf", { tf });
    }
    if (alertType) {
      subQuery.andWhere("alert.alert_data->>'alert' ILIKE :alertType", {
        alertType: `%${alertType}%`,
      });
    }
    if (daysAgo && daysAgo > 0) {
      const dateLimit = moment().subtract(daysAgo, 'days').toDate();
      subQuery.andWhere('alert.createdAt > :dateLimit', { dateLimit });
    }
    if (ticker) {
      subQuery.andWhere("alert.alert_data->>'ticker' = :ticker", { ticker });
    }

    const validSortColumns = ['createdAt', 'updatedAt', 'id'];
    if (!validSortColumns.includes(sortBy)) {
      sortBy = 'createdAt';
    }

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
