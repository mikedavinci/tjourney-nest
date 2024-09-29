import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinmarketcapModule } from './coinmarketcap/coinmarketcap.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HttpModule } from '@nestjs/axios';
import { MailModule } from './mail/mail.module';
import { OrganizationModule } from './organization/organization.module';
import { SendpulseModule } from './sendpulse/sendpulse.module';
import { CareerModule } from './career/career.module';
import { ContactUsModule } from './contact_us/contact_us.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AffiliatePartnersModule } from './affiliate_partners/affiliate_partners.module';
import { HelpcenterModule } from './helpcenter/helpcenter.module';
import { StripeModule } from './stripe/stripe.module';
import { AlertModule } from './alerts/alerts.module';
import { CrmModule } from './crm/crm.module';
import { ClerkModule } from './clerk/clerk.module';
import { PolygonModule } from './polygon/polygon.module';
import { RapidapiModule } from './rapidapi/rapidapi.module';
import { TwelvedataModule } from './twelvedata/twelvedata.module';

@Module({
  imports: [
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: 'schema.gql',
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ThrottlerModule.forRoot([
          {
            ttl: 30, // Time-to-live (in seconds) for the request count for 60 seconds
            limit: 1000, // Max # of requests per user within the ttl durationsxs
          },
        ]),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        url: process.env.DO_DATABASE_URL,
        // 'postgres://mickey:SiSePuede25!!@159.65.175.175:5432/tj',
        // process.env.NODE_ENV !== 'production'
        //   : process.env.PROD_DATABASE_URL,
        synchronize:
          configService.get('NODE_ENV') !== 'production' ? true : false,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migration/**/*{.ts,.js}'],
        cli: {
          migrationsDir: __dirname + '/migration/',
        },
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
    AuthModule,
    AlertModule,
    CoinmarketcapModule,
    CoingeckoModule,
    UsersModule,
    MailModule,
    OrganizationModule,
    SendpulseModule,
    CareerModule,
    ContactUsModule,
    AffiliatePartnersModule,
    HelpcenterModule,
    StripeModule,
    CrmModule,
    ClerkModule,
    PolygonModule,
    RapidapiModule,
    TwelvedataModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
