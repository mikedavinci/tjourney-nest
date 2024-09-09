import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

import { SendResetPasswordDto } from './dto/send-reset-password.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guards/http-google-oath.guard';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { UserNewOnboardDto } from './dto/user-new-onboard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { StartPhoneLoginDto } from './dto/start-phone-login.dto';
import { VerifyPhoneCodeDto } from './dto/verify-phone-code.dto';

@ApiTags('Authentication')
@ApiExcludeController()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  signUp(
    @Body() userSignupDto: UserSignupDto
  ): Promise<{ statusCode: number; message: string; data?: UserResponseDto }> {
    return this.authService.signUp(userSignupDto);
  }

  @Post('/onboard')
  onboard(
    @Body() useronboardDto: UserNewOnboardDto
  ): Promise<{ statusCode: number; message: string; data?: UserResponseDto }> {
    return this.authService.onboard(useronboardDto);
  }

  @Post('/sign-in')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto
  ): Promise<UserResponseDto> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('/send-verification-email')
  async sendVerificationEmail(@Body() body: { email: string }): Promise<any> {
    return this.authService.sendEmailVerification(body.email);
  }

  @Post('/verify-email')
  async verifyEmail(
    @Body() body: { email: string; token: string }
  ): Promise<any> {
    return this.authService.verifyEmail(body.email, body.token);
  }

  // @Post('start-phone-signin')
  // async startPhoneSignIn(
  //   @Body('phoneNumber') phoneNumber: string,
  //   @Req() request: Request,
  // ) {
  //   console.log('Full request:', JSON.stringify(request.body, null, 2));
  //   if (!phoneNumber) {
  //     throw new BadRequestException('Phone number is required');
  //   }
  //   return this.authService.startPhoneSignIn(phoneNumber);
  // }

  // @Post('verify-phone-code')
  //   async verifyPhoneCode(
  //     @Body('signInId') signInId: string,
  //     @Body('code') code: string,
  //   ) {
  //     if (!signInId || !code) {
  //       throw new BadRequestException('Sign-in ID and verification code are required');
  //     }
  //     return this.authService.verifyPhoneCode(signInId, code);
  //   }

  // @Post('refresh')
  // async refreshSession(@CurrentUser() user: User) {
  //   try {
  //     if (!user) {
  //       return {
  //         statusCode: 401,
  //         message: 'Invalid session',
  //       };
  //     }

  //     const latestUser = await this.authService.findUserByEmail(user.email);
  //     if (!latestUser) {
  //       return {
  //         statusCode: 404,
  //         message: 'User not found',
  //       };
  //     }

  //     const newToken = this.authService.generateJwt(latestUser);
  //     console.log('newToken', newToken);
  //     return {
  //       statusCode: 200,
  //       data: {
  //         ...this.authService.getUserData(latestUser),
  //         refreshToken: newToken,
  //         refreshTokenExpiresAt: new Date(
  //           Date.now() + 30 * 24 * 60 * 60 * 1000
  //         ).toISOString(),
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       statusCode: 500,
  //       message: 'Server error',
  //     };
  //   }
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('session')
  // async getSession(@CurrentUser() user: User) {
  //   if (!user) {
  //     return {
  //       statusCode: 401,
  //       message: 'Invalid session',
  //     };
  //   }

  //   const latestUser = await this.authService.findUserByEmail(user.email);
  //   if (!latestUser) {
  //     return {
  //       statusCode: 404,
  //       message: 'User not found',
  //     };
  //   }

  //   return {
  //     statusCode: 200,
  //     data: this.authService.getUserData(latestUser),
  //   };
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('user-information')
  // async getUserInformation(@CurrentUser() user: User) {
  //   const latestUser = await this.authService.findUserById(user.id);
  //   if (!latestUser) {
  //     return {
  //       statusCode: 404,
  //       message: 'User not found',
  //     };
  //   }
  //   return {
  //     statusCode: 200,
  //     data: this.authService.getUserData(latestUser),
  //   };
  // }

  // @UseGuards(RefreshJwtAuthGuard)
  // @Post('/refresh')
  // refreshToken(@Req() request: Request): Promise<any> {
  //   return this.authService.refreshToken(request.body.refresh);
  // }

  // @Post('/send-reset-password')
  // sendResetPassword(@Body() body: SendResetPasswordDto): Promise<any> {
  //   return this.authService.sendResetPassword(body.email);
  // }

  // @Post('/reset-password')
  // resetPassword(@Body() body: ResetPasswordDto): Promise<any> {
  //   return this.authService.resetPassword(body);
  // }

  // @Get('google/login')
  // @UseGuards(GoogleAuthGuard)
  // handleLogin() {
  //   return { msg: 'Google Authentication' };
  // }

  // // api/auth/google/redirect
  // @Get('google/redirect')
  // @UseGuards(GoogleAuthGuard)
  // handleRedirect() {
  //   return { msg: 'OK' };
  // }

  // @Get('status')
  // user(@Req() request: Request) {
  //   console.log(request.user);
  //   if (request.user) {
  //     return { msg: 'Authenticated' };
  //   } else {
  //     return { msg: 'Not Authenticated' };
  //   }
  // }

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
