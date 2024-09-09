import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';
import { AffiliatePartner } from 'src/affiliate_partners/entities/affiliate_partner.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetPassword(user: User, resetToken: string) {
    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      template: './password-reset.hbs', // `.hbs` extension is appended automatically
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
      template: './password-reset-confirmation.hbs',
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

  async sendVerificationEmailOnboard(user: User, token: string) {
    // Similar to sendResetPassword method, but with a different email template
    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify Your Email',
      template: './verify-onboard.hbs', // ✏️ path to template from `views` folder
      context: {
        // ✏️ filling curly brackets with content
        email: user.email,
        token,
        verifyUrl: `${process.env.VERIFY_EMAIL_URL}`,
      },
    });
  }

  async sendCareerSubmissionEmail() {
    return await this.mailerService.sendMail({
      to: 'support@pilotwizard.ai',
      subject: 'New Career Submission',
      template: './career-submission.hbs',
    });
  }

  async sendOrganizationCreationEmail() {
    return await this.mailerService.sendMail({
      to: 'support@pilotwizard.ai',
      subject: 'New Organization Created',
      template: './organization-creation.hbs',
    });
  }

  async sendPlanSelectionEmail(selectedPlan: string, existingUserEmail: User) {
    return await this.mailerService.sendMail({
      to: existingUserEmail.email,
      subject: 'Plan Selected',
      template: './templates/plan-selection.hbs',
      context: {
        // ✏️ filling curly brackets with content
        plan: selectedPlan,
      },
    });
  }

  async newUserSignedUp() {
    return await this.mailerService.sendMail({
      to: 'support@pilotwizard.ai',
      subject: 'New User Signed Up',
      template: './new-user-signup.hbs',
    });
  }

  async welcomeNewUser(user: User) {
    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Pilot Wizard',
      template: './welcome-new-user.hbs',
      context: {
        name: user.name,
      },
    });
  }

  async affiliatePartnerSignedUp(existingAffiliatePartner: User) {
    return await this.mailerService.sendMail({
      to: existingAffiliatePartner.email,
      subject: 'Welcome to the Affiliate Partner Program',
      template: './new-affiliate-partner.hbs',
      context: {
        name: existingAffiliatePartner.name,
      },
    });
  }

  async sendAffiliatePartnerApplicationEmail() {
    return await this.mailerService.sendMail({
      to: 'support@pilotwizard.ai',
      subject: 'New Affiliate Partner Application',
      template: './affiliate-partner-application.hbs',
    });
  }

  async sendHelpcenterEmail() {
    return await this.mailerService.sendMail({
      to: 'support@pilotwizard.ai',
      subject: 'Helpcenter Submission',
      template: './helpcenter-submission.hbs',
    });
  }
}
