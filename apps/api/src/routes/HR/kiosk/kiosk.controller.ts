import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { KioskService } from './kiosk.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { getDataSchema } from './kiosk.schema';

@Controller('kiosk')
@UseGuards(new AuthGuard('employees'))
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  @Get('')
  getData(@Query(new ZodPiPe(getDataSchema)) query) {
    return this.kioskService.getData(query);
  }
}
