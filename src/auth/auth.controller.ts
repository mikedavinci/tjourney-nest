import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { Request } from 'express';

import { HttpGoogleOAuthGuard } from './guards/http-google-oath.guard';
import { SendResetPasswordDto } from './dto/send-reset-password.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { User } from 'src/users/entities/user.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
// import { HttpUser } from './decorators/http-user.decorator';
// import { GoogleLoginUserDto } from './dto/google-login.dto';

@UseGuards(HttpGoogleOAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() userSignupDto: UserSignupDto): Promise<User> {
    return this.authService.signUp(userSignupDto);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('/send-reset-password')
  sendResetPassword(@Body() body: SendResetPasswordDto): Promise<any> {
    return this.authService.sendResetPassword(body.email);
  }

  @Post('/reset-password')
  resetPassword(@Body() body: ResetPasswordDto): Promise<any> {
    return this.authService.resetPassword(body);
  }
}
