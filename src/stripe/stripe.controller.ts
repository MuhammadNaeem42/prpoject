import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/create-checkout-session')
  // @Redirect()
  async createCheckoutSession(@Body() body: any): Promise<{ url: string }> {
    const lookupKey = body.lookup_key;
    console.log(lookupKey);

    if (!lookupKey) {
      throw new BadRequestException(
        `Body is malformed. Missing lookupKey property.`,
      );
    }

    const url = await this.stripeService.createCheckoutSession(lookupKey);
    return { url };
  }
}
