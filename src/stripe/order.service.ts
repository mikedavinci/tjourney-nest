import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>
  ) {}

  // async saveOrderDetails(createOrderDto: CreateOrderDto): Promise<Order> {
  //   const { user } = createOrderDto;

  //   const order = this.orderRepository.create({
  //     user,
  //   });

  //   return this.orderRepository.save(order);
  // }
}
