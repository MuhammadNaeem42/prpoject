// support.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Injectable()
export class SupportService {
  private config;
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      email: this.configService.get<string>('SUPPORT_EMAIL'),
      password: this.configService.get<string>('SUPPORT_EMAIL_PASSWORD'),
    };

    this.transporter = createTransport({
      host: 'smtpout.secureserver.net',
      port: 587,
      secure: false,
      logger: true,
      debug: true,
      auth: {
        user: this.config.email,
        pass: this.config.password,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });
  }

  async sendSupportEmail(
    name: string,
    email: string,
    content: string,
  ): Promise<void> {
    const mailOptions = {
      from: email,
      to: this.config.email,
      subject: 'New Support Request',
      text: `User Name: ${name}\nRequest: ${content}`,
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log(response);
    } catch (error) {
      throw new Error('Error sending email');
    }
  }

  async sendFeedbackEmail(
    name: string,
    email: string,
    content: string,
    rating: number,
  ): Promise<void> {
    const mailOptions = {
      from: email,
      to: this.config.email,
      subject: 'New User Feedback',
      text: `Rating: ${rating}/5\nUser Name: ${name}\nFeedback: ${content}`,
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log(response);
    } catch (error) {
      throw new Error('Error sending email');
    }
  }
}
