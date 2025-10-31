import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { AreasService } from './areas.service';
import { getAreasSchema, getDayDataSchema } from './areas.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';

@ApiTags('Reports Orders')
@Controller('reports/areas')
@UseGuards(new AuthGuard('reports_areas'))
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  getAreas(@Query(new ZodPiPe(getAreasSchema)) query) {
    return this.areasService.getAreas(query);
  }

  @Get('day')
  getDayData(@Query(new ZodPiPe(getDayDataSchema)) query) {
    return this.areasService.getDayData(query);
  }
}
