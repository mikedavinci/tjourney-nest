import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface AlertData {
  alert: string;
  ticker: string;
  tf: string;
  ohlcv: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
  bartime: number;
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: number | undefined;

  @Column('jsonb', { nullable: false, default: {} })
  alert_data: AlertData;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
