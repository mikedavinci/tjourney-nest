import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiExcludeController, ApiTags } from '@nestjs/swagger';
// import { GoogleAuthGuard } from './auth/guards/http-google-oath.guard';
@ApiBearerAuth()
@ApiTags('Hello')
@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
