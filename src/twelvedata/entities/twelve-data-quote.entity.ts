import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('twelve_data_quote')
@Index(['symbol'], { unique: true })
@Index(['symbol', 'updatedDate'])
export class TwelveDataQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  symbol: string;

  @Index()
  @Column({ nullable: true })
  name?: string;

  @Index()
  @Column({ nullable: true })
  exchange?: string;

  @Column({ nullable: true })
  datetime?: string;

  @Column({ type: 'bigint', nullable: true })
  timestamp?: number;

  @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true })
  open?: number;

  @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true })
  high?: number;

  @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true })
  low?: number;

  @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true })
  close?: number;

  @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true })
  previous_close?: number;

  @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true })
  change?: number;

  @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true })
  percent_change?: number;

  @Column({ nullable: true })
  is_market_open?: boolean;

  @Column('json', { nullable: true })
  fifty_two_week?: object;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate?: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate?: Date;
}
