import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { OrdersService } from './order.service';
import { Order } from './entities/order.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, User]), UsersModule],
  controllers: [StripeController],
  providers: [StripeService, ProductService, OrdersService],
})
export class StripeModule {}
