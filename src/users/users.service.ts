import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserSignupDto } from '../auth/dto/user-signup.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserInput } from './dto/update-user.input';
import { HttpService } from '@nestjs/axios';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  checkUserPermission(id: number, currentUser: any) {
    if (currentUser && id != currentUser.userId) {
      throw new UnauthorizedException(
        'You do not have permission to access this user!',
      );
    }
  }

  checkUserPermissionByEmail(email: string, currentUser: any) {
    if (currentUser && email != currentUser.email) {
      throw new UnauthorizedException(
        'You do not have permission to access this user!',
      );
    }
  }

  async create(createUserDto: UserSignupDto): Promise<User> {
    try {
      // Check if the user already exists
      const existingUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // If user does not exist, proceed with creation
      const saltOrRounds = Number(
        this.configService.get('SALT_ROUNDS') || process.env.SALT_ROUNDS,
      );

      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltOrRounds,
      );

      const user = this.userRepository.create(createUserDto);
      const newUser = await this.userRepository.save(user);

      const userResponse = new UserResponseDto();
      userResponse.id = newUser.id;
      userResponse.email = newUser.email;
      userResponse.displayName = newUser.displayName;
      userResponse.name = newUser.name;
      userResponse.emailVerified = newUser.emailVerified;

      return newUser;

      // this.sendSMSVerificationCode(newUser.user_id);
    } catch (error) {
      // Rethrow the error to be handled by NestJS's global exception filter
      // or a controller-level exception filter.
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: [
        // 'mm_transactions',
        // 'login_events',
        // 'userDrugs',
        // 'userDoctors',
        // 'userPharms',
        // 'userDiagnoses',
        // 'loginEvents',
        // 'summaryStates',
      ],
    });
  }

  async findOne(id: number, currentUser: any = null): Promise<User> {
    this.checkUserPermission(id, currentUser);

    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: [],
    });
  }

  async findOneById(id: number, currentUser: any = null): Promise<User> {
    this.checkUserPermission(id, currentUser);

    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByEmail(email: string, currentUser: any = null): Promise<User> {
    this.checkUserPermissionByEmail(email, currentUser);

    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findOneByEmailWithRelations(
    email: string,
    currentUser: any = null,
  ): Promise<User> {
    this.checkUserPermissionByEmail(email, currentUser);

    return this.userRepository.findOne({
      where: {
        email,
      },
      // relations: [
      //   'mm_transactions',
      //   'login_events',
      //   'userDrugs',
      //   'userDoctors',
      //   'userPharms',
      //   'userDiagnoses',
      //   'loginEvents',
      //   'summaryStates',
      // ],
    });
  }

  async update(
    id: number,
    updateUserInput: UpdateUserInput,
    currentUser: any = null,
  ) {
    this.checkUserPermission(id, currentUser);

    if (updateUserInput.password) {
      const saltOrRounds = Number(
        this.configService.get('SALT_ROUNDS') || process.env.SALT_ROUNDS,
      );

      updateUserInput.password = await bcrypt.hash(
        updateUserInput.password,
        saltOrRounds,
      );
    }

    const user: User = this.userRepository.create(updateUserInput);
    user.id = id;
    return this.userRepository.save(user);
  }

  async remove(id: number, currentUser: any = null): Promise<void> {
    this.checkUserPermission(id, currentUser);
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User does not exist`);
    }
  }

  //Revoke HipaaStatus Endpoint, hipaa status turns to Expired, expires exactly 2 years from Approved date timestamp
  // async updateHipaaStatus(
  //   user_id: string,
  //   hipaaStatus: HipaaStatus,
  //   currentUser: any = null,
  // ) {
  //   this.checkUserPermission(user_id, currentUser);

  //   const user = await this.userRepository.findOne(user_id);

  //   if (!user) {
  //     throw new NotFoundException(`User does not exist`);
  //   }

  //   user.hipaaStatus = hipaaStatus;
  //   user.updatedDate = new Date();
  //   user.hipaaAgreementDate = user.updatedDate;
  //   console.log(user.hipaaAgreementDate);
  //   return this.userRepository.save(user);
  // }

  // async revokeHipaa(user_id: string, currentUser: any = null) {
  //   return await this.updateHipaaStatus(
  //     user_id,
  //     HipaaStatus.Expired,
  //     currentUser,
  //   );
  // }

  async saveEntity(user: User) {
    return this.userRepository.save({ ...user });
  }

  // async sendSMSVerificationCode(user_id: string, currentUser: any = null) {
  //   this.checkUserPermission(user_id, currentUser);
  //   const user = await this.findOneById(user_id);

  //   if (!user) {
  //     throw new NotFoundException(`User does not exist`);
  //   }

  //   const url = this.configService.get('SMS_DOMAIN') + '/api/v1/text/send';
  //   const randomCode = Math.floor(100000 + Math.random() * 900000);

  //   const data = {
  //     data: [
  //       {
  //         to: user.mobile,
  //         from: 'default',
  //         body: `Your verification code is ${randomCode}`,
  //         governor_type: 'unlimited',
  //         message_type: 'operational',
  //         program: 'medicare',
  //         campaign: 'health_report_app_verification_code',
  //         template_name: 'sms_verification_code',
  //         source: 'hiq_digital_med',
  //       },
  //     ],
  //   };

  //   const response = await lastValueFrom(
  //     this.httpService.post(url, data, {
  //       auth: {
  //         username: this.configService.get('SMS_USERNAME'),
  //         password: this.configService.get('SMS_PASSWORD'),
  //       },
  //     }),
  //   );

  //   console.log(response);
  //   if (response.status === 200 && response.data.status === 200) {
  //     user.verification_code = randomCode + '';
  //     const newUser = await this.saveEntity(user);
  //     return newUser;
  //   }

  //   throw new Error(response.data.message);
  // }

  // async verifySMSCode(
  //   user_id: string,
  //   verification_code: string,
  //   currentUser: any = null,
  // ) {
  //   const user = await this.findOneById(user_id, currentUser);

  //   if (!user) {
  //     throw new NotFoundException(`User does not exist`);
  //   }

  //   if (user.verification_code !== verification_code || user.confirmed) {
  //     throw new NotFoundException('Invalid verification code');
  //   }

  //   user.confirmed = true;
  //   user.confirmed_date = new Date();
  //   const newUser = await this.saveEntity(user);

  //   return newUser;
  // }
}
