import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      displayName: profile.displayName,
    });
    console.log('Validate');
    console.log(user);
    return user || null;
  }
}

// previous implementation
// async (
//   accessToken: string,
//   refreshToken: string,
//   params: GoogleCallbackParameters,
//   profile: Profile,
//   done: VerifyCallback,
// ) => {
//   const { expires_in, id_token } = params;
//   const {
//     id,
//     name,
//     emails,
//     photos,
//     _json: { email_verified },
//   } = profile;
//   const user = {
//     providerAccountId: id,
//     email: emails[0].value,
//     email_verified,
//     firstName: name.givenName,
//     lastName: name.familyName,
//     picture: photos[0].value,
//     accessToken,
//     refreshToken,
//     id_token,
//     expires_in,
//   };
//   done(null, user);
// },
