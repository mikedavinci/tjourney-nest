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
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { MailModule } from './mail/mail.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    ConfigModule.forRoot({
      envFilePath: [
        // `.env.${process.env.NODE_ENV}.local`,
        // `.env.${process.env.NODE_ENV}`,
        '.env.local',
        '.env',
      ],
      // validationSchema: Joi.object({
      //   SUPABASE_DATABASE_URL: Joi.string().required(),
      //   DIRECT_URL: Joi.string().required(),
      //   GOOGLE_CLIENT_ID: Joi.string().required(),
      //   GOOGLE_CLIENT_SECRET: Joi.string().required(),
      //   GOOGLE_CALLBACK_URL: Joi.string().required(),
      //   SUPABASE_JWT_SECRET: Joi.string().required(),
      // }),
    }),
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
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DO_DATABASE_URL'),
        autoLoadEntities: true,
        entities: ['dist/**/*.entity{.ts,.js}'],
        logging: true,
        synchronize: true,
        cache: false,
      }),
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: configService.get('HTTP_TIMEOUT') || 5000,
        maxRedirects: configService.get('HTTP_MAX_REDIRECTS') || 5,
      }),
    }),

    AuthModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    AlertModule,
    CoinmarketcapModule,
    CoingeckoModule,
    OneinchModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
