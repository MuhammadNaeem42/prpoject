import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(':domain')
  handShake(@Param('domain') domain: string): string {
    return this.authService.handShake(domain);
  }

  @Post('register/:uid')
  registerUser(@Param('uid') uid: string): string {
    return this.authService.registerUser(uid);
  }

  @Post('registerStore/:uid')
  async registerStore(@Body() body: any, @Param('uid') uid: string) {
    const { domain } = body;

    const result = await this.authService.registerStore(uid, domain);
    return {
      message: result,
      status: HttpStatus.CREATED,
    };
  }

  @Get('/stores/:uid')
  async getStores(@Param('uid') uid: string): Promise<string[]> {
    return await this.authService.getStores(uid);
  }
}
