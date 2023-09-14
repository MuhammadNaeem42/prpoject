// support.controller.ts
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('reelife')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('support')
  async sendSupportEmail(
    @Body() data: { name: string; email: string; content: string },
  ): Promise<any> {
    const { name, email, content } = data;

    try {
      await this.supportService.sendSupportEmail(name, email, content);
      return {
        message: 'Successfully sent support email',
        status: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('feedback')
  async sendFeedbackEmail(
    @Body()
    data: {
      name: string;
      email: string;
      content: string;
      rating: number;
    },
  ): Promise<any> {
    const { name, email, content, rating } = data;

    try {
      await this.supportService.sendFeedbackEmail(name, email, content, rating);
      return {
        message: 'Successfully sent feedback email',
        status: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
