import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: true })
  session_id: string;

  @Column({ nullable: true })
  client_reference_id: string;

  @Column({ nullable: true })
  customer_id: string;

  @Column({ nullable: true })
  customer_email: string;

  @Column({ nullable: true })
  invoice: string;

  @Column({ nullable: true })
  payment_status: string;

  @Column({ nullable: true })
  amount_subtotal: number;

  @Column({ nullable: true })
  amount_total: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  subscription: string;

  @Column({ type: 'jsonb', nullable: true })
  total_details: object;

  @Column({ nullable: true })
  amount_discount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
