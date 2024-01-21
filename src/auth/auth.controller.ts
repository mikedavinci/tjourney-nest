import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

import { SendResetPasswordDto } from './dto/send-reset-password.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guards/http-google-oath.guard';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  signUp(@Body() userSignupDto: UserSignupDto): Promise<UserResponseDto> {
    return this.authService.signUp(userSignupDto);
  }

  @Post('/sign-in')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<UserResponseDto> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('/verify-email')
  async verifyEmail(
    @Body() body: { email: string; token: string },
  ): Promise<any> {
    return this.authService.verifyEmail(body.email, body.token);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('/refresh-token')
  refreshToken(@Req() request: Request): Promise<any> {
    return this.authService.refreshToken(request.body.refresh);
  }

  @Post('/send-reset-password')
  sendResetPassword(@Body() body: SendResetPasswordDto): Promise<any> {
    return this.authService.sendResetPassword(body.email);
  }

  @Post('/reset-password')
  resetPassword(@Body() body: ResetPasswordDto): Promise<any> {
    return this.authService.resetPassword(body);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'Google Authentication' };
  }

  // api/auth/google/redirect
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect() {
    return { msg: 'OK' };
  }

  @Get('status')
  user(@Req() request: Request) {
    console.log(request.user);
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }

  // ********** GOOGLE AUTH **********
  // @SetMetadata('google-login', true)
  // @UseGuards(HttpGoogleOAuthGuard)
  // @Get()
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // async googleAuth(@Req() _req: Request) {}

  // @SetMetadata('google-login', true)
  // @UseGuards(HttpGoogleOAuthGuard)
  // @Get('google-redirect')
  // googleAuthRedirect(@HttpUser() user: GoogleLoginUserDto) {
  //   return this.authService.googleLogin(user);
  // }
}
