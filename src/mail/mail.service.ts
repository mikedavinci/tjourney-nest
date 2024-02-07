import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetPassword(user: User, resetToken: string) {
    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      template: './password-reset', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        email: user.email,
        resetToken,
        resetUrl: `${process.env.RESET_PASSWORD_URL}`,
      },
    });
  }

  async sendPasswordResetConfirmation(user: User) {
    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Confirmation',
      template: './password-reset-confirmation',
      context: {
        // ✏️ filling curly brackets with content
        email: user.email,
      },
    });
  }

  async sendVerificationEmail(user: User, token: string) {
    // Similar to sendResetPassword method, but with a different email template
    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify Your Email',
      template: './verify.hbs', // ✏️ path to template from `views` folder
      context: {
        // ✏️ filling curly brackets with content
        email: user.email,
        token,
        verifyUrl: `${process.env.VERIFY_EMAIL_URL}`,
      },
    });
  }
}
