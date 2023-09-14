// stripe.service.ts

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';

const PAXIFY_DASHBOARD = 'https://app.paxify.io/subscriptions';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
    });
  }

  async createCheckoutSession(lookupKey: string): Promise<string> {
    const prices = await this.stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${PAXIFY_DASHBOARD}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PAXIFY_DASHBOARD}?canceled=true`,
      subscription_data: {
        trial_period_days: 7,
      },
    });

    return session.url;
  }
}
