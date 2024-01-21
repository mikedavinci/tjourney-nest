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
    try {
      const user = await this.userService.create(createUserDto);

      // Send email verification
      await this.sendEmailVerification(user);

      // Convert User entity to UserResponseDto
      const userResponse = new UserResponseDto();
      userResponse.id = user.id;
      userResponse.email = user.email;
      userResponse.displayName = user.displayName;
      userResponse.name = user.name;
      userResponse.emailVerified = user.emailVerified;

      return userResponse;
    } catch (error) {
      console.log(error);
    }
  }

  // TODO: SET A THROTTLE FOR THIS METHOD, MAXIMUM 2 EMAIL PER 60 MINUTES
  async sendEmailVerification(user: User): Promise<{ message: string }> {
    // Check if the user's email is already verified
    if (user.emailVerified) {
      return { message: 'Email is already verified.' };
    }

    try {
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      user.token = token;
      await this.userRepository.save(user);

      await this.mailService.sendVerificationEmail(user, token);
      return { message: 'Verification email sent.' };
    } catch (error) {
      console.error(error);
      return {
        message: 'Failed to send verification email. Please try again later.',
      };
    }
  }

  async verifyEmail(email: string, token: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException('Invalid email');
      }

      // Check if the user's email is already verified
      if (user.emailVerified) {
        return { message: 'Email is already verified.' };
      }

      if (user.token !== token) {
        throw new NotFoundException('Invalid token, contact support for help.');
      }

      user.emailVerified = true;
      user.token = null;
      await this.userRepository.save(user);
      return { message: 'Email verified successfully!', emailVerified: true };
    } catch (error) {
      console.log(error);
      return {
        message: 'Failed to verify email. Please try again.',
      };
    }
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

    // Check if email is verified
    if (!user.emailVerified) {
      // Resend email verification
      await this.sendEmailVerification(user);
      throw new UnauthorizedException(
        'Email not verified. Please check your inbox for the verification email.',
      );
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        email,
        sub: user.id,
      };

      // access token
      const accessTokenExpirationMinutes = 28800; // 8 hours
      const accessToken: string = this.jwtService.sign(payload, {
        expiresIn: accessTokenExpirationMinutes,
      });
      const accessTokenExpiresAt = addMinutes(
        new Date(),
        accessTokenExpirationMinutes / 60,
      );

      // refresh token
      const refreshTokenExpirationMinutes = 86400; // 24 hours
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
        accessToken: accessToken,
        accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
        refreshToken: refreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
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
        accessToken: accessToken,
      };
    } catch (error) {
      // Handle the error when the refresh token is expired or invalid
      console.error(error.message);
      return null; // or return { access_token: null };
    }
  }

  async sendResetPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);

    // Return a generic message if user not found
    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link will be sent',
      };
    }

    // Check if an unexpired token already exists
    if (user.resetToken && new Date(user.resetTokenExpiry) > new Date()) {
      // Resend the existing unexpired token
      try {
        await this.mailService.sendResetPassword(user, user.resetToken);
      } catch (error) {
        console.error('Failed to resend Reset Password email:', error);
      }
      return { message: 'Reset Password email resent successfully' };
    }

    user.resetToken = Math.floor(100000 + Math.random() * 900000) + '';
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // expires in 1 hour
    await this.userService.saveEntity(user);

    try {
      await this.mailService.sendResetPassword(user, user.resetToken);
    } catch (error) {
      // Log the error internally, but don't change the response to the user
      console.error('Failed to send Reset Password email:', error);
    }

    // Return a success message
    return { message: 'Reset Password email sent successfully' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userService.findOneByEmail(dto.email);
    // Check for user existence and token validity
    if (
      !user ||
      user.resetToken !== dto.resetToken ||
      new Date() > new Date(user.resetTokenExpiry)
    ) {
      return { message: 'Invalid or expired token' };
    }

    const saltOrRounds = Number(
      this.configService.get('SALT_ROUNDS') || process.env.SALT_ROUNDS,
    );
    user.password = await bcrypt.hash(dto.password, saltOrRounds);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userService.saveEntity(user);

    try {
      await this.mailService.sendPasswordResetConfirmation(user);
    } catch (error) {
      // Log the error internally, but don't change the response to the user
      console.error('Failed to send password reset confirmation email:', error);
    }

    // Return a success message
    return { message: 'Password reset successfully' };
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
