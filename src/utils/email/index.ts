import config from '@config';
import { logger } from '@/utils/logger';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import * as pug from 'pug';
import i18n from 'i18n';
import filesystem from '../os/filesystem';

type TemplateName = keyof typeof mailTemplateMap;

const mailTemplateMap = {
  resetPassword: 'reset-password',
  verifyEmail: 'verify-email',
  notifyAdmin: 'notify-admin',
  notifyUser: 'notify-user',
  emailUserAfterRegistration: 'email-user-after-registration',
};

/**
 * Email sending utility
 */
export class EmailUtils {
  private static instance: EmailUtils;
  private transporter: Transporter;
  private isConnectingToEmailServer = false;

  private constructor() {
    this.transporter = nodemailer.createTransport(config.email.smtp);
  }

  /**
   * Try to connect to the email server
   *
   *
   * Note: True is not a guarantee that the connection is successful.
   * It can means that the connection is successful or the environment is skipped.
   *
   * @param skipEnvs Environments to skip connecting to email server
   * @returns Promise<boolean> True if connected, false otherwise.
   */
  public async connectToEmailServer(
    skipEnvs: string[] = ['test']
  ): Promise<boolean> {
    this.transporter = nodemailer.createTransport(config.email.smtp);

    if (skipEnvs.includes(config.env)) {
      console.log('Env: ' + config.env + ' is skipped');
      return true;
    } else {
      try {
        await this.transporter.verify();
        logger.info('🟢 Connected to email server');
        this.isConnectingToEmailServer = true;
        return true;
      } catch (error) {
        logger.warn(
          '🔴 Unable to connect to email server. Make sure you have configured the SMTP options in .env'
        );

        return false;
      }
    }
  }

  public static getInstance(): EmailUtils {
    if (!EmailUtils.instance) {
      EmailUtils.instance = new EmailUtils();
    }
    return EmailUtils.instance;
  }

  public async sendEmail(
    to: string,
    subject: string,
    text?: string,
    html?: string
  ): Promise<void> {
    if (!this.isConnectingToEmailServer) {
      const isConnected = await this.connectToEmailServer();

      // Don't try to send email if the connection is failed
      if (!isConnected) {
        return;
      }

      this.isConnectingToEmailServer = true;
    }

    const mailOptions = { from: config.email.from, to, subject };
    if (text) {
      Object.assign(mailOptions, { text });
    }
    if (html) {
      Object.assign(mailOptions, { html });
    }
    await this.transporter.sendMail(mailOptions);
  }

  private compileTemplate(
    templateName: TemplateName,
    templateData: object,
    locale: string
  ): string {
    const templatePath = path.join(
      filesystem.rootDir(),
      'src',
      'views',
      'emails',
      locale,
      `${mailTemplateMap[templateName]}.pug`
    );
    const compiledTemplate = pug.compileFile(templatePath);
    return compiledTemplate(templateData);
  }

  public async sendResetPasswordEmail(
    to: string,
    token: string,
    locale = 'en'
  ): Promise<void> {
    i18n.setLocale(locale);

    const subject = i18n.__('resetPassword.subject');
    const resetPasswordUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    const html = this.compileTemplate(
      'resetPassword',
      { resetPasswordUrl, email: to },
      locale
    );

    await this.sendEmail(to, subject, undefined, html);
  }

  public async sendVerificationEmail(
    to: string,
    token: string,
    locale = 'en'
  ): Promise<void> {
    i18n.setLocale(locale);

    const subject = i18n.__('verifyEmail.subject');
    const verificationEmailUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    const html = this.compileTemplate(
      'verifyEmail',
      { verificationEmailUrl, email: to },
      locale
    );
    await this.sendEmail(to, subject, undefined, html);
  }
}

export default EmailUtils.getInstance();
