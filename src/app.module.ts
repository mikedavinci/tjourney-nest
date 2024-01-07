import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AlertModule } from './alerts/alerts.module';
import { CoinmarketcapModule } from './coinmarketcap/coinmarketcap.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { OneinchModule } from './oneinch/oneinch.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ThrottlerModule.forRoot([
          {
            ttl: 60, // Time-to-live (in seconds) for the request count for 60 seconds
            limit: 100, // Maximum number of requests per user within the ttl duration
          },
        ]),
      ],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: true,
        synchronize: true,
        cache: false,
      }),
      inject: [ConfigService],
    }),
    AlertModule,
    CoinmarketcapModule,
    CoingeckoModule,
    OneinchModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
