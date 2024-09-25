import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  // 'postgres://mickey:SiSePuede25!!@159.65.175.175:5432/ptwd'  'postgres://mickeyprod:SiSePuede25!!@159.65.175.175:5432/pwprod'
  url: 'postgres://mickey:SiSePuede25!!@159.65.175.175:5432/tjbe',
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
