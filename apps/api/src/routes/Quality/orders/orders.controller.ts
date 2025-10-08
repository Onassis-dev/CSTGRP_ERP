import { Controller, Get, UseGuards, Query, Put, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  getDestinationsSchema,
  orderFilterSchema,
  updateDestinationPalletsSchema,
} from './orders.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Quality Orders')
@Controller('quality/orders')
@UseGuards(new AuthGuard('quality'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  get(@Query(new ZodPiPe(orderFilterSchema)) query) {
    return this.ordersService.findAllOrders(query);
  }

  @Get('destinations')
  getDestinations(@Query(new ZodPiPe(getDestinationsSchema)) query) {
    return this.ordersService.findDestinations(query);
  }

  @Put('destinations')
  updateDestinationPallets(
    @Body(new ZodPiPe(updateDestinationPalletsSchema)) body,
  ) {
    return this.ordersService.updateDestinationPallets(body);
  }
}
