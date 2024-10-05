import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AffiliatePartner {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  affiliateCode: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  coverLetter: string;

  @Column({ nullable: true })
  hearAboutUs: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  commissionRate: number;

  @Column({ nullable: true })
  paymentThreshold: number;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  promotionalMaterials: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedDate: Date;

  // @OneToOne(() => User)
  // @JoinColumn()
  // user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
