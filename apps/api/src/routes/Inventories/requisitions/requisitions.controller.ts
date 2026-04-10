import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RequisitionsService } from './requsitions.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  jobsSchema,
  movementsFilterSchema,
  requisitionSchema,
  suppliesSchema,
} from './requsitions.schema';

@Controller('requisitions')
@UseGuards(new AuthGuard('requisitions'))
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Get('movements')
  getMovements(@Query(new ZodPiPe(movementsFilterSchema)) params) {
    return this.requisitionsService.getMovements(params);
  }

  @Get('jobs')
  getPendingJobs(@Query(new ZodPiPe(jobsSchema)) params) {
    return this.requisitionsService.getPendingJobs(params);
  }

  @Post()
  createRequisition(@Body(new ZodPiPe(requisitionSchema)) body) {
    return this.requisitionsService.createRequisition(body);
  }

  @Post('supplies')
  createSuppliesRequisition(@Body(new ZodPiPe(suppliesSchema)) body) {
    return this.requisitionsService.createSupplyRequisition(body);
  }

  @Get('export-pending')
  exportPending() {
    return this.requisitionsService.exportPending();
  }
}
