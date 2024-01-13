import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../users/utils/jwt-payload.interface';
import { UserService } from 'src/users/users.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { email, sub } = payload;
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { userId: sub, email: email };
  }
}
