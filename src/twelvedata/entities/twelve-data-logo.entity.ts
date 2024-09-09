import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('twelve_data_logo')
@Index(['symbol', 'url', 'logoBase', 'logoQuote'])
export class TwelveDataLogo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  symbol: string;

  @Index()
  @Column({ nullable: true })
  url: string;

  @Index()
  @Column({ nullable: true })
  logoBase: string;

  @Index()
  @Column({ nullable: true })
  logoQuote: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
