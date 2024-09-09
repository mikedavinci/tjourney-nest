import { Injectable } from '@nestjs/common';
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
import { UserNewOnboardDto } from './dto/user-new-onboard';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService
  ) {}

  async signUp(
    createUserDto: UserSignupDto
  ): Promise<{ statusCode: number; message: string; data?: UserResponseDto }> {
    try {
      const user = await this.userService.create(createUserDto);

      // Send email verification
      await this.sendEmailVerification(user.email);

      return {
        statusCode: 201, // 201 for created
        message: 'An email has been sent to you. Please verify your account.',
        // data: userResponse,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500, // Internal Server Error
        message: 'Failed to create user. Please try again.',
      };
    }
  }

  async onboard(
    onboardUserDto: UserNewOnboardDto
  ): Promise<{ statusCode: number; message: string; data?: UserResponseDto }> {
    try {
      const user = await this.userService.onboard(onboardUserDto);

      // Send email verification
      await this.sendEmailVerification(user.email);

      // Convert User entity to UserResponseDto
      // const userResponse = new UserResponseDto();
      // userResponse.id = user.id;
      // userResponse.email = user.email;
      // userResponse.displayName = user.displayName;
      // userResponse.name = user.name;
      // userResponse.emailVerified = user.emailVerified;

      return {
        statusCode: 201,
        message: 'An email has been sent to you. Please verify your account.',
        // data: userResponse,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Failed to create user. Please try again.',
      };
    }
  }

  async sendEmailVerification(
    email: string
  ): Promise<{ statusCode: number; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        statusCode: 404,
        message: 'Something is wrong with the email you provided.',
      }; // Not Found
    }

    if (user.emailVerified) {
      return { statusCode: 400, message: 'Email is already verified.' };
    }

    try {
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      user.token = token;
      await this.userRepository.save(user);

      await this.mailService.sendVerificationEmailOnboard(user, token);
      return { statusCode: 200, message: 'Verification email sent.' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Failed to send verification email. Please try again later.',
      };
    }
  }

  async verifyEmail(
    email: string,
    token: string
  ): Promise<{ message: string; statusCode: number }> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return {
          message: 'Something is wrong with the email you provided.',
          statusCode: 404,
        }; // Not Found
      }

      if (user.emailVerified) {
        return { message: 'Email is already verified.', statusCode: 200 }; // OK
      }

      if (user.token !== token) {
        return {
          message: 'Invalid token, try again or Resend Verification Code.',
          statusCode: 400,
        }; // Bad Request
      }

      user.emailVerified = true;
      user.token = null;
      user.isOnboarded = true;
      await this.userRepository.save(user);
      await this.mailService.welcomeNewUser(user);
      return { message: 'Email verified successfully!', statusCode: 200 }; // OK
    } catch (error) {
      console.error(error);
      return {
        message: 'Failed to verify email. Please try again.',
        statusCode: 500,
      }; // Internal Server Error
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
      return { statusCode: 404, message: 'User not found' };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      await this.sendEmailVerification(email);
      return {
        statusCode: 401,
        message:
          'Email not verified. Please check your inbox for the verification email.',
      };
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        email,
        sub: user.id,
      };

      // access token 30 days in minutes
      const accessTokenExpirationMinutes = 2592000; // 30 days in seconds 2592000
      // 72 hours is 259200 seconds and 8 hours is 28800 seconds
      const accessToken: string = this.jwtService.sign(payload, {
        expiresIn: accessTokenExpirationMinutes,
      });
      const accessTokenExpiresAt = addMinutes(
        new Date(),
        accessTokenExpirationMinutes / 60
      );

      // refresh token
      const refreshTokenExpirationMinutes = 2592000; // 30 days in seconds 2592000
      const refreshToken: string = this.jwtService.sign(payload, {
        expiresIn: refreshTokenExpirationMinutes,
      });
      const refreshTokenExpiresAt = addMinutes(
        new Date(),
        refreshTokenExpirationMinutes / 60
      );

      const userResponse = new UserResponseDto();
      userResponse.id = user.id;
      userResponse.name = user.name;
      userResponse.displayName = user.displayName;
      userResponse.email = user.email;
      userResponse.emailVerified = user.emailVerified;
      userResponse.isOnboarded = user.isOnboarded;
      userResponse.isProMember = user.isProMember;
      userResponse.tempPlanSelected = user.tempPlanSelected;
      userResponse.isAffiliate = user.isAffiliate;
      userResponse.isAdmin = user.isAdmin;
      userResponse.orgAssociated = user.orgAssociated;
      userResponse.selectedPlan = user.selectedPlan;
      userResponse.flowReady = user.flowReady;

      return {
        statusCode: 200,
        message: 'Login successful',
        data: {
          ...userResponse,
          accessToken: accessToken,
          accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
          refreshToken: refreshToken,
          refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
        },
      };
    } else {
      return {
        statusCode: 401,
        message: 'Please check your login credentials',
      };
    }
  }

  async verifySessionToken(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token);
      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  async findUserById(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  generateJwt(user: User): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, { expiresIn: '30d' }); // Assuming 30 days expiry
  }

  getUserData(user: User) {
    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      isOnboarded: user.isOnboarded,
      isProMember: user.isProMember,
      tempPlanSelected: user.tempPlanSelected,
      isAffiliate: user.isAffiliate,
      isAdmin: user.isAdmin,
      orgAssociated: user.orgAssociated,
      selectedPlan: user.selectedPlan,
      flowReady: user.flowReady,
    };
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
      const token: string = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'), // use your access token secret
        expiresIn: 2592000, // 30 days in seconds 2592000
      });

      return {
        refreshToken: token,
      };
    } catch (error) {
      // Handle the error when the refresh token is expired or invalid
      console.error(error.message);
      return {
        error: 'Invalid or expired refresh token',
        statusCode: 500,
        refreshToken: null,
      };
    }
  }

  async sendResetPassword(
    email: string
  ): Promise<{ message: string; statusCode: number }> {
    const user = await this.userService.findOneByEmail(email);

    // Return a generic message if user not found
    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link will be sent',
        statusCode: 200, // OK, or consider using 404 if you prefer to indicate user not found
      };
    }

    // Check if an unexpired token already exists
    if (user.resetToken && new Date(user.resetTokenExpiry) > new Date()) {
      // Resend the existing unexpired token
      try {
        await this.mailService.sendResetPassword(user, user.resetToken);
      } catch (error) {
        console.error('Failed to resend Reset Password email:', error);
        return {
          message: 'Failed to resend Reset Password email',
          statusCode: 500,
        }; // Internal Server Error
      }
      return {
        message: 'Reset Password email resent successfully',
        statusCode: 200,
      }; // OK
    }

    user.resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // expires in 1 hour
    await this.userService.saveEntity(user);

    try {
      await this.mailService.sendResetPassword(user, user.resetToken);
    } catch (error) {
      console.error('Failed to send Reset Password email:', error);
      return {
        message: 'Failed to send Reset Password email',
        statusCode: 500,
      }; // Internal Server Error
    }

    // Return a success message
    return {
      message: 'Reset Password email sent successfully',
      statusCode: 200,
    }; // OK
  }

  async resetPassword(
    dto: ResetPasswordDto
  ): Promise<{ statusCode: number; message: string }> {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user) {
      return {
        statusCode: 404,
        message: 'Something is wrong with the email you provided.',
      }; // Not Found
    }

    if (
      user.resetToken !== dto.resetToken ||
      new Date() > new Date(user.resetTokenExpiry)
    ) {
      return { statusCode: 400, message: 'Invalid or expired token' }; // Bad Request
    }

    const saltOrRounds = Number(
      this.configService.get('SALT_ROUNDS') || process.env.SALT_ROUNDS
    );
    user.password = await bcrypt.hash(dto.password, saltOrRounds);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userService.saveEntity(user);

    try {
      await this.mailService.sendPasswordResetConfirmation(user);
    } catch (error) {
      console.error('Failed to send password reset confirmation email:', error);
      return {
        statusCode: 500,
        message: 'Failed to send password reset confirmation email',
      };
    }

    return { statusCode: 200, message: 'Password reset successfully' }; // OK
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
