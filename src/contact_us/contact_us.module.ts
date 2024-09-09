import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUs } from './entities/contact_us.entity';
import { ContactUsController } from './contact_us.controller';
import { ContactUsService } from './contact_us.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs])],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
