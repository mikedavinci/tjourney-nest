import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('twelve_data_symbol_search')
@Index(['symbol', 'instrumentName'])
export class TwelveDataSymbolSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ fulltext: true })
  @Column()
  symbol: string;

  @Index({ fulltext: true })
  @Column()
  instrumentName: string;

  @Index()
  @Column()
  exchange: string;

  @Column()
  micCode: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  exchangeTimezone: string;

  @Column()
  instrumentType: string;

  @Index()
  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  currency: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
