import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database, child, get, getDatabase, ref, set } from 'firebase/database';
import { transformDomain } from 'src/helpers';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private db: Database;
  private dbReferences;

  constructor(private readonly configService: ConfigService) {
    this.db = getDatabase();
    this.dbReferences = {
      events: this.configService.get<string>('FIREBASE_EVENTS_DB'),
      stores: this.configService.get<string>('FIREBASE_STORES_DB_INSTANCE'),
      tracking: this.configService.get<string>(
        'FIREBASE_EVENTS_DB_TRACKING_SUBKEY',
      ),
      domain: this.configService.get<string>(
        'FIREBASE_EVENTS_DB_DOMAIN_SUBKEY',
      ),
      users: this.configService.get<string>('FIREBASE_USERS_DB'),
    };
  }

  handShake(domain: string): string {
    return `Hello ${domain}`;
  }

  registerUser(uid: string): string {
    const usersDbRef = ref(this.db, this.dbReferences.users);
    const userInstance = child(usersDbRef, uid);

    // Create a new user instance, if it does not exist
    get(userInstance).then(async (snapshot: any) => {
      if (!snapshot.exists()) {
        // User does not exist, generate access token add this user inside array
        const accessToken = uuidv4();

        console.log('accessToken', accessToken);

        set(userInstance, {
          createdAt: Date.now(),
          plan: 'Basic',
        });
      }
    });

    return `Registering user ${uid}`;
  }

  async registerStore(uid: string, domain: string): Promise<string> {
    // Check if domain is valid
    const domainRegex = new RegExp(
      /^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/,
    );

    if (!domainRegex.test(domain)) {
      throw new HttpException(
        'Domain is not in a valid format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const usersDbRef = ref(this.db, this.dbReferences.users);
    const userInstance = child(usersDbRef, uid);

    const snapshot = await get(userInstance);

    if (snapshot.exists()) {
      const { plan } = snapshot.val();
      if (plan === Subscription.BASIC) {
        // Create a store instance under userInstance which will be an array of domains

        const accessToken = `${uuidv4().toString().substring(0, 6)}${uid}`;

        const storeObject = {
          domain: transformDomain(domain),
          label: domain,
          accessToken,
          createdAt: Date.now(),
        };

        const existingStores = await get(
          child(userInstance, this.dbReferences.stores),
        );

        if (existingStores.exists()) {
          const stores = existingStores.val();
          const storeExists = stores.find((store) => store === domain);

          if (storeExists) {
            throw new HttpException(
              'This store is not available',
              HttpStatus.CONFLICT,
            );
          }
        }

        if (existingStores.exists() && existingStores.val().length >= 1) {
          throw new HttpException(
            'You have reached the maximum number of stores for your subscription plan',
            HttpStatus.FORBIDDEN,
          );
        }

        if (!existingStores.exists()) {
          // Store does not exist, create a new store instance
          await set(child(userInstance, this.dbReferences.stores), [
            storeObject,
          ]);
        }

        const newStores = existingStores.exists()
          ? [...existingStores.val(), storeObject]
          : [storeObject];

        await set(child(userInstance, this.dbReferences.stores), newStores);

        const registeredStores = await get(
          ref(this.db, this.dbReferences.stores),
        );

        if (!registeredStores.exists()) {
          // Store does not exist, create a new store instance
          set(ref(this.db, this.dbReferences.stores), [domain]);
        } else {
          const existingStores = registeredStores.val();
          const updatedStores = [...existingStores, domain];
          set(ref(this.db, this.dbReferences.stores), updatedStores);
        }

        return 'Store registered';
      }
    }
    throw new HttpException(
      'Your subscription plan does not allow store registration',
      HttpStatus.FORBIDDEN,
    );
  }

  async getStores(uid: string): Promise<string[]> {
    const usersDbRef = ref(this.db, this.dbReferences.users);
    const userInstance = child(usersDbRef, uid);
    const storeInstance = child(userInstance, this.dbReferences.stores);

    const stores = await get(storeInstance);
    if (!stores.exists()) {
      return [];
    }

    return stores.val();
  }
}
