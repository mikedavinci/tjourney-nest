import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtStrategy } from './strategies/jwt.strategy';

// @Module({
//   controllers: [AuthController],
//   providers: [
//     AuthService,
// {
//   provide: APP_GUARD,
//   useClass: JwtAuthGuard,
// },
//   ],
// })
// export class AuthModule {}

Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get('SUPABASE_JWT_SECRET') ||
          process.env.SUPABASE_JWT_SECRET,
        signOptions: {
          expiresIn: 3600,
        },
      }),
    }),
    UsersModule,

    MailModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
});
export class AuthModule {}
