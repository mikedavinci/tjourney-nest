import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './users.controller';
import Mail from 'nodemailer/lib/mailer';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    HttpModule,
    MailModule,
  ],
  providers: [UserController, UserService],
  exports: [UserService],
})
export class UsersModule {}
