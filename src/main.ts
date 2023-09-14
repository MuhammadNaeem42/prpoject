import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const CORS_WHITELIST = [
  'localhost:5173',
  'http://localhost:3001',
  'http://localhost:8000',
  'https://app.paxify.io',
  'https://www.paxify.io',
  'https://reelife.paxify.io',
  'https://paxify-demo-store.myshopify.com',
];

const configService = new ConfigService();

async function bootstrap() {
  const PORT = configService.get<string>('PORT');

  const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   origin: (origin, callback) => {
  //     console.log('DOMAIN CHECK:', origin);
  //     if (CORS_WHITELIST.includes(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(
  //         new Error(
  //           'Domain is not registered with Paxify. If you think this is a mistake, please contact support@paxify.io',
  //         ),
  //       );
  //     }
  //   },
  // });
  app.enableCors({
    origin: '*',
  });
  await app.listen(PORT);
}
bootstrap();

const firebaseConfig = {
  apiKey: configService.get<string>('FIREBASE_API_KEY'),
  authDomain: configService.get<string>('FIREBASE_AUTH_DOMAIN'),
  databaseURL: configService.get<string>('FIREBASE_DB_URL'),
  projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
  storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: configService.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
  appId: configService.get<string>('FIREBASE_APP_ID'),
  measurementId: configService.get<string>('FIREBASE_MEASUREMENT_ID'),
};

let firebase: any = null;
let webAuth: any = null;

if (!firebase) {
  firebase = initializeApp(firebaseConfig);
  webAuth = getAuth();
}

export { firebase, webAuth };
