import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Contact } from './contact-status.entity';

export enum DealStatus {
  PROSPECT = 'Prospect',
  PROPOSAL_SENT = 'Proposal Sent',
  IN_NEGOTIATION = 'In Negotiation',
  WON = 'Won',
  LOST = 'Lost',
}

export enum DealStage {
  QUALIFICATION = 'Qualification',
  NEEDS_ANALYSIS = 'Needs Analysis',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

@Entity()
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  value: number;

  @Column({ type: 'enum', enum: DealStatus, default: DealStatus.PROSPECT })
  status: DealStatus;

  @Column({ type: 'enum', enum: DealStage })
  stage: DealStage;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  closeDate: Date;

  @Column('text', { array: true, nullable: true })
  products: string[];

  @ManyToOne(() => User, (user) => user.deals)
  user: User;

  @ManyToOne(() => Contact, (contact) => contact.deals)
  contact: Contact;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
