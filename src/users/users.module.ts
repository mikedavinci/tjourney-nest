import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserResolver } from './users.resolver';

@Module({
  imports: [],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UsersModule {}
