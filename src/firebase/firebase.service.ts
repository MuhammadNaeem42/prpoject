import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database, child, get, getDatabase, ref, set } from 'firebase/database';
import { EVENTS } from './firebase.enum';
import { FirebasePayload, TrackingObject } from './firebase.interface';
import { transformDomain } from 'src/helpers';

@Injectable()
export class FirebaseService {
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
      resources: this.configService.get<string>(
        'FIREBASE_RESOURCES_DB_INSTANCE',
      ),
    };
  }

  pushTrackingObject(trackingObject: TrackingObject): boolean {
    const eventsRef = ref(this.db, this.dbReferences.events);
    const storesRef = ref(this.db, this.dbReferences.stores);

    const domain = transformDomain(trackingObject.payload.domain);

    const eventsParentKey = child(eventsRef, domain);
    const storesParentKey = child(storesRef, domain);

    get(storesParentKey)
      .then((snapshot: any) => {
        if (snapshot.exists()) {
          // Domain already exists do nothing
        } else {
          // Domain does not exist, add this domain inside array
          set(storesParentKey, {
            type: 'ecommerce-store',
          });
        }
      })
      .catch((error: Error) => {
        console.error(error);
        return false;
      });

    get(eventsParentKey)
      .then((snapshot: any) => {
        if (snapshot.exists()) {
          // Domain already exists
          const object = snapshot.val();
          const trackingEvent: FirebasePayload = {
            name: trackingObject.event,
            time: trackingObject.payload.time,
            device: trackingObject.payload.device,
          };

          if (trackingEvent.name === EVENTS.SLIDE_VIEWED) {
            trackingEvent.slide = trackingObject.payload.slide;
          }

          if (trackingEvent.name === EVENTS.STORY_VIEWED) {
            trackingEvent.story = trackingObject.payload.story;
          }

          const updatedEvents = [...object.tracking, trackingEvent];
          set(
            child(eventsParentKey, this.dbReferences.tracking),
            updatedEvents,
          );
        } else {
          // Domain does not exist, this is first tracking event
          set(child(eventsParentKey, this.dbReferences.domain), domain);
          set(child(eventsParentKey, this.dbReferences.tracking), [
            {
              name: trackingObject.event,
              time: trackingObject.payload.time,
            },
          ]);
        }
      })
      .catch((error: Error) => {
        console.error(error);
        return false;
      });

    return true;
  }

  async getStoreEvents(uid: string, domain: string): Promise<any> {
    const db = getDatabase();
    const eventsRef = ref(db, this.dbReferences.events);

    const storeRef = child(eventsRef, transformDomain(domain));

    const usersRef = ref(db, this.dbReferences.users);
    const storeInstance = child(usersRef, uid);

    const usersSnapshot = await get(storeInstance);
    if (usersSnapshot.exists()) {
      const stores = usersSnapshot.val().stores;
      const isOwner = stores.filter((store) => store.domain === domain)[0];

      if (isOwner) {
        const snapshot = await get(storeRef);
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          throw new HttpException('No data available', HttpStatus.NOT_FOUND);
        }
      }
    }
    throw new HttpException('Access denied', HttpStatus.UNAUTHORIZED);
  }

  async getConsumedResourcesForMonth(domain: string): Promise<any> {
    const resources = {};
    const eventsRef = ref(this.db, this.dbReferences.events);
    const transformedDomain = transformDomain(domain);

    const eventsParentKey = child(eventsRef, transformedDomain);

    try {
      const eventsSnapshot = await get(eventsParentKey);

      const currentMonth = new Date().getMonth();

      const events = eventsSnapshot.val().tracking.filter((event: any) => {
        const eventMonth = new Date(event.time).getMonth();
        return eventMonth === currentMonth;
      });

      // Only one store per user is supported for now
      resources['stores'] = 1;

      resources['components'] = 1;

      resources['pageViews'] = events.filter(
        (event: any) => event.name === EVENTS.INITIALIZED,
      ).length;
      resources['apiCalls'] = events.length;

      return resources;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  updateResources(accessKey: string, componentCount: number) {
    const db = getDatabase();
    const resourceRef = ref(db, this.dbReferences.resources);

    const uid = accessKey.substring(6);
    const resourceInstance = child(resourceRef, uid);

    set(resourceInstance, {
      componentCount,
    });
  }
}
