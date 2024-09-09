import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @Column({ nullable: true })
  organizationName: string;

  @Column({ nullable: true })
  organizationType: string;

  @Column({ nullable: true })
  organizationSize: string;

  @Column({ nullable: true })
  targetAudience: string;

  @Column({ nullable: true })
  challenges: string;

  @Column({ nullable: true })
  previousStrategy: string;

  @Column({ nullable: true })
  objectives: string;

  @Column({ nullable: true })
  mainCompetitors: string;

  @Column({ nullable: true })
  typicalCustomerJourney: string;

  @Column({ nullable: true })
  brandPersonality: string;

  @Column({ nullable: true })
  brandValues: string;

  @Column({ nullable: true })
  userExperience: string;

  @Column({ nullable: true })
  facebook_url: string;

  @Column({ nullable: true })
  twitter_url: string;

  @Column({ nullable: true })
  instagram_url: string;

  @Column({ nullable: true })
  linkedin_url: string;

  @Column({ nullable: true })
  youtube_url: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  about: string;

  @Column('jsonb', { name: 'video_development', default: [], nullable: true })
  video_development: string[];

  @Column('jsonb', {
    name: 'landing_page_development',
    default: [],
    nullable: true,
  })
  landing_page_development: string[];

  @Column('jsonb', { name: 'content_creation', default: [], nullable: true })
  content_creation: string[];

  @Column('jsonb', {
    name: 'live_chat_implementation',
    default: [],
    nullable: true,
  })
  live_chat_implementation: string[];

  @Column('jsonb', {
    name: 'knowledge_base_development',
    default: [],
    nullable: true,
  })
  knowledge_base_development: string[];

  @Column('jsonb', {
    name: 'email_marketing_campaign',
    default: [],
    nullable: true,
  })
  email_marketing_campaign: string[];

  @Column('jsonb', {
    name: 'email_marketing_management',
    default: [],
    nullable: true,
  })
  email_marketing_management: string[];

  @Column('jsonb', {
    name: 'social_media_campaign_management',
    default: [],
    nullable: true,
  })
  social_media_campaign_management: string[];

  @Column('jsonb', { name: 'seo', default: [], nullable: true })
  seo: string[];

  @Column('jsonb', { name: 'ai_training', default: [], nullable: true })
  ai_training: string[];

  @Column('jsonb', { name: 'crm_storage', default: [], nullable: true })
  crm_storage: string[];

  @Column('jsonb', {
    name: 'payment_gateway_implementation',
    default: [],
    nullable: true,
  })
  payment_gateway_implementation: string[];

  @Column('jsonb', { name: 'site_analytics', default: [], nullable: true })
  site_analytics: string[];

  @Column('jsonb', { name: 'custom_llm', default: [], nullable: true })
  custom_llm: string[];

  @Column('jsonb', { name: 'sms_campaign', default: [], nullable: true })
  sms_campaign: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
