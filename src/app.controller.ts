import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from './auth/guards/clerk-auth.guard';
@ApiBearerAuth()
@ApiTags('Hello-World')
// @ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(ClerkAuthGuard)
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
