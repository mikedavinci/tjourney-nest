import { Organization } from 'src/organization/entities/organization.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Plans } from '../plans.enum';
import { AffiliatePartner } from 'src/affiliate_partners/entities/affiliate_partner.entity';
import { Order } from 'src/stripe/entities/order.entity';
import { Contact } from 'src/crm/entities/contact-status.entity';
import { Deal } from 'src/crm/entities/deal.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: true })
  displayName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  isOnboarded: boolean;

  @Column({ nullable: true })
  sp_client_id: string;

  @Column({ nullable: true })
  sp_client_secret: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isAffiliate: boolean;

  // @OneToOne(() => AffiliatePartner, (affiliatePartner) => affiliatePartner.user)
  // affiliatePartner: AffiliatePartner;

  @Column({ default: false })
  isProMember: boolean;

  @Column({ default: false })
  tempPlanSelected: boolean;

  @Column({ default: false })
  flowReady: boolean;

  @Column({ nullable: true })
  selectedPlan: Plans;

  @Column({ default: false })
  orgAssociated: boolean;

  @Column({ default: false })
  agreedTOSPrivacy: boolean;

  @Column('text', { array: true, nullable: true })
  objectives: string[];

  @Column({ nullable: true })
  organizationId: number;

  // @Column({ nullable: true })
  // origin_source: string;

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[];

  @OneToMany(() => Deal, (deal) => deal.user)
  deals: Deal[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
