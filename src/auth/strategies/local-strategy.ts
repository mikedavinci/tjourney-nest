import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
    this.authService = authService;
  }
  async validate(email: string, password: string) {
    const credentialsDto = new AuthCredentialsDto();
    credentialsDto.email = email;
    credentialsDto.password = password;

    // const user = await this.authService.validateUser(credentialsDto);
    // if (!user) {
    //   throw new UnauthorizedException('Please check your login credentials');
    // }
    // return user;
  }
}
