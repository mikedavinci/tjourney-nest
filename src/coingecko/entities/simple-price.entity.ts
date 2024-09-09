// simple-price.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('simple_price')
@Index(['coinId', 'vs_currency', 'updatedAt'])
@Unique(['coinId', 'vs_currency'])
export class SimplePrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  coinId: string;

  @Column()
  vs_currency: string;

  @Column('decimal', { nullable: true })
  price: number;

  @Column('decimal', { nullable: true })
  market_cap: number;

  @Column('decimal', { nullable: true })
  vol_24h: number;

  @Column('decimal', { nullable: true })
  change_24h: number;

  @Column({ nullable: true })
  last_updated_at: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
