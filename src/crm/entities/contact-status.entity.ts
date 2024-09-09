import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Deal } from './deal.entity';

export enum ContactStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  UNQUALIFIED = 'Unqualified',
  NURTURING = 'Nurturing',
  ENGAGED = 'Engaged',
  INACTIVE = 'Inactive',
  LOST = 'Lost',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  position: string;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.NEW })
  status: ContactStatus;

  @OneToMany(() => Deal, (deal) => deal.contact)
  deals: Deal[];

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  lastContactDate: Date;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.contacts)
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
