import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  internal_code: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true, default: false })
  subscription: boolean;

  @Column({ nullable: true })
  price_per_month: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  quantity: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  stripe_product_id: string;

  @Column({ nullable: true })
  stripe_price_id: string;

  @Column({ nullable: true })
  payment_method_types: string;

  @Column({ nullable: true })
  tax_code: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
