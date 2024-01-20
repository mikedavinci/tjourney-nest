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
import { addMinutes } from 'date-fns';
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

      // access token
      const accessTokenExpirationMinutes = 60;
      const accessToken: string = this.jwtService.sign(payload, {
        expiresIn: accessTokenExpirationMinutes,
      });
      const accessTokenExpiresAt = addMinutes(
        new Date(),
        accessTokenExpirationMinutes / 60,
      );

      // refresh token
      const refreshTokenExpirationMinutes = 120;
      const refreshToken: string = this.jwtService.sign(payload, {
        expiresIn: refreshTokenExpirationMinutes,
      });
      const refreshTokenExpiresAt = addMinutes(
        new Date(),
        refreshTokenExpirationMinutes / 60,
      );

      const userResponse = new UserResponseDto();
      userResponse.id = user.id;
      userResponse.email = user.email;
      userResponse.displayName = user.displayName;
      userResponse.name = user.name;
      userResponse.emailVerified = user.emailVerified;

      return {
        ...userResponse,
        access_token: accessToken,
        access_token_expires_at: accessTokenExpiresAt.toISOString(),
        refresh_token: refreshToken,
        refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
      };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      // Verify and decode the refresh token
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get('JWT_SECRET'), // use your refresh token secret
      });

      // Check if the token has the necessary payload
      if (!decoded || !decoded.email || !decoded.sub) {
        throw new Error('Invalid token payload');
      }

      // Payload is valid, create a new access token
      const payload: JwtPayload = {
        email: decoded.email,
        sub: decoded.sub,
      };
      const accessToken: string = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'), // use your access token secret
        expiresIn: '2m', // set your desired expiration time for access token
      });

      return {
        access_token: accessToken,
      };
    } catch (error) {
      // Handle the error when the refresh token is expired or invalid
      console.error(error.message);
      return null; // or return { access_token: null };
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
