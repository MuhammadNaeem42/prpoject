import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { TrackingObject } from './firebase.interface';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('/tracking')
  pushTrackingObject(@Body() body: TrackingObject): boolean {
    return this.firebaseService.pushTrackingObject(body);
  }

  @Get('/resources/:domain')
  getResources(@Param('domain') domain: string): any {
    return this.firebaseService.getConsumedResourcesForMonth(domain);
  }

  @Get('tracking/:uid/:domain')
  async getStoreEvents(@Param() params: any) {
    const { uid, domain } = params;
    try {
      const result = await this.firebaseService.getStoreEvents(uid, domain);
      return {
        data: result,
        message: 'Successfully retrieved events',
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

  @Post('/update-resources')
  updateResources(@Body() body: any) {
    const { accessKey, componentCount } = body;
    this.firebaseService.updateResources(accessKey, componentCount);

    return {
      message: 'Successfully updated resources',
      status: HttpStatus.CREATED,
    };
  }
}
