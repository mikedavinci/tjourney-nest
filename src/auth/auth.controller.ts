import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { Request } from 'express';

import { HttpGoogleOAuthGuard } from './guards/http-google-oath.guard';
// import { HttpUser } from './decorators/http-user.decorator';
// import { GoogleLoginUserDto } from './dto/google-login.dto';

@UseGuards(HttpGoogleOAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // @Get()
  // async googleAuth(@Req() _req: Request) {}

  // @Get('google-redirect')
  // googleAuthRedirect(@HttpUser() user: GoogleLoginUserDto) {
  //   return this.authService.googleLogin(user);
  // }
}
