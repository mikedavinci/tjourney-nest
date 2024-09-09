import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// import { config } from 'dotenv';

// config();

// const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  // 'postgres://mickey:NoMames24!aA@159.65.175.175:5432/ptwd'
  // 'postgres://mickeyprod:NoMames24!aA@159.65.175.175:5432/pwprod'
  url: 'postgres://mickey:NoMames24!aA@159.65.175.175:5432/ptwd',
  // process.env.NODE_ENV !== 'production'
  //   ? process.env.DO_DATABASE_URL
  //   : process.env.PROD_DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['src/migration/**/*.ts'],
  migrationsRun: true,
  synchronize: false,
  dropSchema: false,
  logging: process.env.NODE_ENV !== 'production' ? true : false,
});
