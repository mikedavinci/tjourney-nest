// time-series-cache.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TwelveDataTimeSeriesDto } from '../dto/twelve-data-time-series.dto';

@Entity()
export class TimeSeriesCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string;

  @Column('json')
  data: TwelveDataTimeSeriesDto;

  @UpdateDateColumn()
  updatedAt: Date;
}
