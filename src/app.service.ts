import { Injectable, UseGuards } from '@nestjs/common';
import { HttpGoogleOAuthGuard } from './auth/guards/http-google-oath.guard';

@Injectable()
export class AppService {
  @UseGuards(HttpGoogleOAuthGuard)
  getHello(): string {
    return 'Hello World!';
  }
}
