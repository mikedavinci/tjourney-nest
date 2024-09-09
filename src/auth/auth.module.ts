import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local-strategy';
import { RefreshJwtStrategy } from './strategies/refresh-token.strategy';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({ isGlobal: true }), // Ensure ConfigModule is global
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // secret: configService.get<string>('JWT_SECRET'),
        // signOptions: {
        //   expiresIn: '30d',
        // },
      }),
    }),
    UsersModule,
    MailModule,
  ],
  providers: [AuthService, JwtStrategy, ClerkAuthGuard],
  controllers: [AuthController],
  exports: [ ClerkAuthGuard],
})
export class AuthModule {}
