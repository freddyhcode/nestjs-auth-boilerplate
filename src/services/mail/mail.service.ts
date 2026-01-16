import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Inject, Injectable } from '@nestjs/common';
import { MAIL_CONFIG_OPTIONS } from './constants/mail.constant';
import type { MailModuleOptions } from './interfaces/mail-options.interface';
import { resetPasswordTemplate } from './template/reset-password.template';
import { MailType } from './enums/mail-type.enum';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(MAIL_CONFIG_OPTIONS)
    private readonly options: MailModuleOptions,
  ) {
    const transportOptions: SMTPTransport.Options = {
      host: this.options.host,
      port: this.options.port,
      secure: this.options.secure,
      ignoreTLS: this.options.ignoreTls,
    };

    if (this.options.user && this.options.pass) {
      transportOptions.auth = {
        user: this.options.user,
        pass: this.options.pass,
      };
    }

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  public async send(type: MailType, to: string, token: string) {
    switch (type) {
      case MailType.PASSWORD_RESET:
        return this.sendPasswordReset(to, token);
    }
  }

  private async sendPasswordReset(to: string, token: string) {
    const resetLink = `${this.options.frontendUrl}/reset-password?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Auth Service" <${this.options.from}>`,
      to,
      subject: 'Recuperación de Contraseña',
      html: resetPasswordTemplate({
        resetLink,
        expiresInMinutes: 5,
      }),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email dispatch failed:', error.message);
      console.error('Error details:', error);
    }
  }
}
