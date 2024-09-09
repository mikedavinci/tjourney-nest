// careers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareersController } from './career.controller';
import { CareersService } from './career.service';
import { Career } from './entities/career.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Career]), MailModule],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareerModule {}
