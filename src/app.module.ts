import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
import { AlertModule } from './alerts/alerts.module';
import { CoinmarketcapModule } from './coinmarketcap/coinmarketcap.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { OneinchModule } from './oneinch/oneinch.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
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
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        // ThrottlerModule.forRoot([
        //   {
        //     ttl: 60, // Time-to-live (in seconds) for the request count for 60 seconds
        //     limit: 100, // Maximum number of requests per user within the ttl duration
        //   },
        // ]),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        url: configService.get('DO_DATABASE_URL'),
        synchronize:
          configService.get('NODE_ENV') !== 'production' ? true : false,
        entities: ['dist/**/*.entity{.ts,.js}'],
        logging: configService.get('NODE_ENV') !== 'production' ? true : false,
      }),
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: configService.get<number>('HTTP_TIMEOUT', 10000), // Timeout for outgoing HTTP requests in milliseconds
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS', 5), // Maximum number of redirects to follow for outgoing HTTP requests
      }),
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
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
