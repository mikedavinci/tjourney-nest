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

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 6 })
  tp1?: number;

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 6 })
  sl1?: number;

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 6 })
  tp2?: number;

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 6 })
  sl2?: number;

  @Column()
  ticker: string;

  @Column('bigint')
  bartime: number;

  @Column({ default: false })
  isStocksAlert: boolean;

  @Column({ default: false })
  isForexAlert: boolean;

  @Column({ default: false })
  isExit: boolean;

  @Column({ type: 'varchar', nullable: true })
  exitType: 'bullish' | 'bearish' | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
