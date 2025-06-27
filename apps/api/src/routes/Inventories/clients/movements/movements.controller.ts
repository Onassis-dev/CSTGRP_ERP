import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { clientSchema, IEFilterSchema } from './movements.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Clients')
@Controller('clients')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get('material/comparison/:id')
  getMaterialComparison(
    @Param(new ZodPiPe(idObjectSchema)) params,
    @Req() req,
    @Query(new ZodPiPe(clientSchema)) query,
  ) {
    return this.movementsService.getMaterialComparison(
      params,
      req.cookies.token,
      query,
    );
  }

  //TODO: Add maintance
  @Get('job/comparison/:id')
  getJobComparison(
    @Param(new ZodPiPe(idObjectSchema)) params,
    @Req() req,
    @Query(new ZodPiPe(clientSchema)) query,
  ) {
    return this.movementsService.getJobComparison(
      params,
      req.cookies.token,
      query,
    );
  }

  @Get()
  get(@Req() req, @Query(new ZodPiPe(clientSchema)) query) {
    return this.movementsService.getInventory(req.cookies.token, query);
  }

  @Get('jobs')
  getJobs(
    @Query(new ZodPiPe(IEFilterSchema)) params,
    @Req() req,
    @Query(new ZodPiPe(clientSchema)) query,
  ) {
    return this.movementsService.getJobs(params, req.cookies.token, query);
  }

  @Get('clients')
  getClients() {
    return this.movementsService.getClients();
  }
}
