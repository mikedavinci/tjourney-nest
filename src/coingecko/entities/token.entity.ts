import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Token')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  token_id: string;

  @Column()
  id: string;

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column({ name: 'web_slug' })
  webSlug: string;

  @Column({ name: 'asset_platform_id', nullable: true })
  assetPlatformId: string | null;

  @Column('jsonb', { name: 'platforms', nullable: true })
  platforms: object | null;

  @Column('jsonb', { name: 'detail_platforms', nullable: true })
  detailPlatforms: object | null;

  @Column({ name: 'block_time_in_minutes', default: 0 })
  blockTimeInMinutes: number;

  @Column({ name: 'hashing_algorithm', nullable: true })
  hashingAlgorithm: string | null;

  @Column('jsonb', { name: 'categories', default: [] })
  categories: string[];

  @Column({ name: 'preview_listing', default: false })
  previewListing: boolean;

  @Column({ name: 'public_notice', nullable: true })
  publicNotice: string | null;

  @Column('jsonb', { name: 'additional_notices', default: [] })
  additionalNotices: string[];

  @Column('jsonb', { name: 'localization', nullable: true })
  localization: object | null;

  @Column('jsonb', { name: 'description', nullable: true })
  description: object | null;

  @Column('jsonb', { name: 'links', nullable: true })
  links: object | null;

  @Column('jsonb', { name: 'image', nullable: true })
  image: object | null;

  @Column({ name: 'country_origin', nullable: true })
  countryOrigin: string | null;

  @Column({ name: 'genesis_date', type: 'date', nullable: true })
  genesisDate: Date | null;

  @Column({ name: 'sentiment_votes_up_percentage', type: 'float', default: 0 })
  sentimentVotesUpPercentage: number;

  @Column({
    name: 'sentiment_votes_down_percentage',
    type: 'float',
    default: 0,
  })
  sentimentVotesDownPercentage: number;

  @Column({ name: 'watchlist_portfolio_users', default: 0 })
  watchlistPortfolioUsers: number;

  @Column({ name: 'market_cap_rank', nullable: true })
  marketCapRank: number | null;

  @Column('jsonb', { name: 'market_data', nullable: true })
  marketData: object | null;

  @Column({
    name: 'last_updated',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastUpdated: Date;

  @Column('jsonb', { name: 'tickers', nullable: true })
  tickers: {
    base: string;
    target: string;
    market: {
      name: string;
      identifier: string;
      has_trading_incentive: boolean;
    };
    last: number;
    volume: number;
    converted_last: {
      btc: number;
      eth: number;
      usd: number;
    };
    converted_volume: {
      btc: number;
      eth: number;
      usd: number;
    };
    trust_score: string;
    bid_ask_spread_percentage: number;
    timestamp: Date;
    last_traded_at: Date;
    last_fetch_at: Date;
    is_anomaly: boolean;
    is_stale: boolean;
    trade_url: string;
    token_info_url: string | null;
    coin_id: string;
    target_coin_id: string;
  }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
