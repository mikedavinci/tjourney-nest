import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';

@ApiBearerAuth()
@ApiTags('Clerk Endpoints')
@Controller('clerk')
export class ClerkController {
  constructor(private readonly clerkService: ClerkService) {}

  @UseGuards(ClerkAuthGuard)
  @Get('get-users')
  async getUsers() {
    return await this.clerkService.getUsers();
  }

  // @Get('get-token')
  // async getToken() {
  //   return await this.clerkService.getToken();
  // }
}

//   @Get(':id')a
//   findOne(@Param('id') id: string) {
//     return this.clerkService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateClerkDto: UpdateClerkDto) {
//     return this.clerkService.update(+id, updateClerkDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.clerkService.remove(+id);
//   }
// }
