import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import {
  approveDeliveriesSchema,
  getDeliveriesSchema,
} from './deliveries.schema';
import { DeliveriesService } from './deliveries.service';

@Controller('contractors/deliveries')
@UseGuards(new AuthGuard())
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get('')
  get(@Query(new ZodPiPe(getDeliveriesSchema)) query) {
    return this.deliveriesService.get(query);
  }

  @Put('approve')
  approveDeliveries(@Body(new ZodPiPe(approveDeliveriesSchema)) body) {
    return this.deliveriesService.approveDeliveries(body);
  }
}
