import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('coingecko_search')
@Index(['name', 'symbol', 'coinId']) // Composite index for main search fields
export class CoinGeckoSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  coinId: string;

  @Index()
  @Column()
  name: string;

  @Column()
  apiSymbol: string;

  @Index()
  @Column()
  symbol: string;

  @Column({ nullable: true })
  marketCapRank: number;

  @Column()
  thumb: string;

  @Column()
  large: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
