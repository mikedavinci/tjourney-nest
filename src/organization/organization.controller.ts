import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationResponseDto } from './dto/response-organization.dto';
import { SelectPlanDto } from 'src/users/dto/select-plan.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: User
  ): Promise<{
    statusCode: number;
    message: string;
    data?: OrganizationResponseDto;
  }> {
    return await this.organizationService.create(createOrganizationDto, user);
  }

  @Post('select-plan')
  @UseGuards(JwtAuthGuard)
  async selectPlan(
    @Body() selectPlanDto: SelectPlanDto,
    @CurrentUser() user: User
  ): Promise<{ statusCode: number; message: string }> {
    return await this.organizationService.selectPlan(
      user,
      selectPlanDto.selectedPlan
    );
  }

  // Get plan
  @UseGuards(JwtAuthGuard)
  @Get('get-plan')
  async getPlan(@CurrentUser() user: User): Promise<{
    statusCode: number;
    message: string;
    data: string;
  }> {
    return await this.organizationService.getPlan(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  // NEED ADMIN GUARD
  async findAll(): Promise<Organization[]> {
    return await this.organizationService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: number,
    @CurrentUser() user: User
  ): Promise<Organization> {
    return await this.organizationService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() user: User
  ): Promise<Organization> {
    return await this.organizationService.update(
      id,
      updateOrganizationDto,
      user
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: number, @CurrentUser() user: User): Promise<void> {
    return this.organizationService.remove(id, user);
  }
}
