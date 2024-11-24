import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// import { config } from 'dotenv';

// config();

// const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  // 'postgres://mickey:SiSePuede25!!@159.65.175.175:5432/ptwd'
  // 'postgres://mickeyprod:SiSePuede25!!@159.65.175.175:5432/pwprod'
  url:
    // process.env.DO_DATABASE_URL,
    'postgresql://mickey:AVNS_Gph4XkuKrFP9B41UT7k@db-postgresql-nyc3-59643-do-user-2321004-0.g.db.ondigitalocean.com:25060/tjbe?sslmode=require',
  // process.env.NODE_ENV !== 'production'
  //   ? process.env.DO_DATABASE_URL
  //   : process.env.PROD_DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['src/migration/**/*.ts'],
  migrationsRun: true,
  synchronize: false,
  dropSchema: false,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.CA_CERT_PATH,
  },
  logging: process.env.NODE_ENV !== 'production' ? true : false,
});
