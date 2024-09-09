import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('search_stock')
export class SearchStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exchange: string;

  @Column()
  ticker: string;

  @Column()
  security_name: string;

  @Column({ nullable: true })
  is_etf: string;

  @Column()
  last_updated: string;

  @Column()
  search_type: string;

  @Column('float')
  similarity_score: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
