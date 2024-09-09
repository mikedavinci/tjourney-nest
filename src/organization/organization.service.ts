import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';
import { User } from 'src/users/entities/user.entity';
import { OrganizationResponseDto } from './dto/response-organization.dto';
import { Plans } from 'src/users/plans.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    user: User
  ): Promise<{
    statusCode: number;
    message: string;
    data?: OrganizationResponseDto;
  }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
      relations: ['organization'],
    });

    if (existingUser.organization) {
      return {
        statusCode: 400,
        message: 'User is already associated with an organization',
      };
    }

    if (existingUser) {
      const organization = this.organizationRepository.create({
        ...createOrganizationDto,
        users: [existingUser],
      });
      await this.organizationRepository.save(organization);

      existingUser.organization = organization;
      existingUser.orgAssociated = true;
      await this.userRepository.save(existingUser);

      await this.mailService.sendOrganizationCreationEmail();

      const organizationResponse = new OrganizationResponseDto();
      organizationResponse.id = organization.id;
      organizationResponse.organizationName = organization.organizationName;

      return {
        statusCode: 201,
        message:
          'Organization created successfully and associated with existing user',
        data: organizationResponse,
      };
    }
  }

  async selectPlan(
    user: User,
    selectedPlan: Plans
  ): Promise<{ statusCode: number; message: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    // console.log(existingUser);

    if (!existingUser) {
      return { statusCode: 404, message: 'User not found' };
    }

    existingUser.selectedPlan = selectedPlan;
    // existingUser.isProMember = true;
    existingUser.tempPlanSelected = true;
    await this.userRepository.save(existingUser);

    // await this.mailService.sendPlanSelectionEmail(selectedPlan, existingUser);

    return {
      statusCode: 201,
      message: `Plan updated to ${selectedPlan}.`,
    };
  }

  async getPlan(user: User): Promise<{
    statusCode: number;
    message: string;
    data: string;
  }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!existingUser) {
      return { statusCode: 404, message: 'User not found', data: null };
    }

    return {
      statusCode: 200,
      message: 'Plan retrieved successfully',
      data: existingUser.selectedPlan,
    };
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({ relations: ['users'] });
  }

  async findOne(id: number, user: User): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const isUserAssociated = organization.users.some((u) => u.id === user.id);
    if (!isUserAssociated) {
      throw new NotFoundException('Organization not found for the user');
    }

    return organization;
  }

  async update(
    id: number,
    updateOrganizationDto: UpdateOrganizationDto,
    user: User
  ): Promise<Organization> {
    const organization = await this.findOne(id, user);
    this.organizationRepository.merge(organization, updateOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async remove(id: number, user: User): Promise<void> {
    const organization = await this.findOne(id, user);
    await this.organizationRepository.remove(organization);
  }
}
