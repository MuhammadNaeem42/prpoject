import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! You have reached Subscriptions API for Paxify.';
  }
}
