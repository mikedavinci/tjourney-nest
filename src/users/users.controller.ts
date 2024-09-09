import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UserSignupDto } from 'src/auth/dto/user-signup.dto';
import { UpdateUserInput } from './dto/update-user.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: UserSignupDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    // Do something with the current user
    return user;
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile-by-email')
  // findOneByEmail(@Param('email') email: string, @Request() req): Promise<User> {
  //   return this.userService.findOneByEmail(email, req.user);
  // }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOneById(@Param('id') id: number, @Request() req): Promise<User> {
    return this.userService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateUser(
    @Param('id') id: number,
    @Body() updateUserInput: UpdateUserInput,
    @Request() req
  ) {
    return this.userService.update(id, updateUserInput, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeUser(@Param('id') id: number, @Request() req) {
    return this.userService.remove(id, req.user);
  }
}
