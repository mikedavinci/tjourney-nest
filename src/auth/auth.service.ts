import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { UserSignupDto } from './dto/user-signup.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from '../users/utils/jwt-payload.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDetails } from 'src/users/utils/types';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async signUp(createUserDto: UserSignupDto): Promise<UserResponseDto> {
    const newUser = await this.userService.create(createUserDto);
    return newUser;
  }

  async validateUser(authCredentialsDto: AuthCredentialsDto): Promise<any> {
    const { email, password } = authCredentialsDto;
    const user = await this.userService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<any> {
    const { email, password } = authCredentialsDto;
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        email,
        sub: user.id,
      };
      const accessToken: string = this.jwtService.sign(payload);

      const userResponse = new UserResponseDto();
      userResponse.id = user.id;
      userResponse.email = user.email;
      userResponse.displayName = user.displayName;
      userResponse.name = user.name;
      userResponse.emailVerified = user.emailVerified;

      return { ...userResponse, access_token: accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async sendResetPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.token = Math.floor(100000 + Math.random() * 900000) + '';
    const newUser = await this.userService.saveEntity(user);
    const emailStatus = await this.mailService.sendResetPassword(
      newUser,
      user.token,
    );

    return emailStatus;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user || user.token !== dto.token) {
      throw new NotFoundException('User not found');
    }

    const saltOrRounds = Number(
      this.configService.get('SALT_ROUNDS') || process.env.SALT_ROUNDS,
    );

    user.token = null;
    user.password = await bcrypt.hash(dto.password, saltOrRounds);

    const newUser = await this.userService.saveEntity(user);

    return newUser;
  }

  async validateGoogleUser(details: UserDetails) {
    console.log('AuthService');
    console.log(details);
    const user = await this.userRepository.findOneBy({ email: details.email });
    console.log(user);
    if (user) return user;
    console.log('User not found. Creating...');
    const newUser = this.userRepository.create(details);
    return this.userRepository.save(newUser);
  }

  async findUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }
}

// *** Previous Google Login Code ***
// async googleLogin(user: GoogleLoginUserDto) {
//   if (!user) {
//     throw new UnauthorizedException('No user from google');
//   }
//   const {
//     firstName,
//     lastName,
//     email,
//     email_verified,
//     expires_in,
//     picture,
//     providerAccountId,
//     accessToken,
//     refreshToken,
//     id_token,
//   } = user;
//   const userData = await this.prisma.users.findFirst({
//     where: { email },
//     include: { accounts: true },
//   });
//   if (!userData) {
//     const newUserData = await this.prisma.users.create({
//       data: {
//         name: `${firstName} ${lastName}`,
//         email: email,
//         emailVerified: email_verified ? new Date().toISOString() : null,
//         image: picture,
//         accounts: {
//           create: {
//             type: 'oauth',
//             provider: 'google',
//             providerAccountId: providerAccountId,
//             access_token: accessToken,
//             refresh_token: refreshToken,
//             id_token: id_token,
//             expires_at: expires_in,
//           },
//         },
//       },
//     });
//     const access_token = await this.signJwt(
//       newUserData.id,
//       id_token,
//       accessToken,
//       expires_in,
//     );
//     return { access_token };
//   }
//   const access_token = await this.signJwt(
//     userData.id,
//     id_token,
//     accessToken,
//     expires_in,
//   );
//   return { access_token };
// }
// signJwt(
//   userId: string,
//   id_token: string,
//   access_token: string,
//   expires_at: number,
//   expiresIn = '1d',
// ): Promise<string> {
//   const payload = {
//     sub: userId,
//     id_token,
//     access_token,
//     expires_at,
//   };
//   return this.jwtService.signAsync(payload, {
//     expiresIn,
//     secret: this.configService.get('JWT_SECRET'),
//   });
// }
