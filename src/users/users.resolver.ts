import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UserSignupDto } from 'src/auth/dto/user-signup.dto';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth-guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User, { name: 'createUser' })
  createUser(@Args('createUserDto') createUserDto: UserSignupDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'getAllUsers' })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'getUserByEmail' })
  findOne(
    @Args('email') email: string,
    @CurrentUser() user: any,
  ): Promise<User> {
    return this.userService.findOneByEmail(email, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'getUserById' })
  findOneById(@Args('id') id: number, @CurrentUser() user: any): Promise<User> {
    return this.userService.findOne(id, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: any,
  ) {
    return this.userService.update(updateUserInput.id, updateUserInput, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, { name: 'deleteUser' })
  removeUser(@Args('id') id: number, @CurrentUser() user: any) {
    return this.userService.remove(id, user);
  }
}
