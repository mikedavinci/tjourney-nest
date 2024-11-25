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
    low: number;
    high: number;
    open: number;
    close: number;
    volume: number;
  };
  tp1?: number;
  sl1?: number;
  tp2?: number;
  sl2?: number;
  bartime: number;
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column()
  tf: string;

  @Column()
  alert: string;

  @Column('jsonb')
  ohlcv: {
    low: number;
    high: number;
    open: number;
    close: number;
    volume: number;
  };

  @Column({ nullable: true })
  tp1?: number;

  @Column({ nullable: true })
  sl1?: number;

  @Column({ nullable: true })
  tp2?: number;

  @Column({ nullable: true })
  sl2?: number;

  @Column()
  ticker: string;

  @Column('bigint')
  bartime: number;

  @Column({ default: false })
  isStocksAlert: boolean;

  @Column({ default: false })
  isForexAlert: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
