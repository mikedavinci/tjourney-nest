import { Module } from '@nestjs/common';
import { HelpcenterService } from './helpcenter.service';
import { HelpcenterController } from './helpcenter.controller';
import { MailModule } from 'src/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Helpcenter } from './entities/helpcenter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Helpcenter]), MailModule],
  controllers: [HelpcenterController],
  providers: [HelpcenterService],
})
export class HelpcenterModule {}
