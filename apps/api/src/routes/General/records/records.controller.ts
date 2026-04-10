import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RecordsService } from './records.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { filtersSchema } from './records.schema';

@Controller('records')
@UseGuards(new AuthGuard('users'))
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  getMaterialMovements(@Query(new ZodPiPe(filtersSchema)) query) {
    return this.recordsService.getRecords(query);
  }
}
