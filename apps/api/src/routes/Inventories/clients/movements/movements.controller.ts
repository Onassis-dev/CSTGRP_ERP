import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { IEFilterSchema } from './movements.schema';
import { idObjectSchema } from 'src/utils/schemas';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(new AuthGuard())
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get('material/comparison/:id')
  getMaterialComparison(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.movementsService.getMaterialComparison(params);
  }

  @Get('job/comparison/:id')
  getJobComparison(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.movementsService.getJobComparison(params);
  }

  @Get()
  get() {
    return this.movementsService.getInventory();
  }

  @Get('jobs')
  getJobs(@Query(new ZodPiPe(IEFilterSchema)) params) {
    return this.movementsService.getJobs(params);
  }
}
