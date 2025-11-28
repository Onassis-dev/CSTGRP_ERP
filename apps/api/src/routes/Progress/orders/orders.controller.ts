import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { OrdersService } from './orders.service';
import { getOrdersSchema } from './orders.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Progress Orders')
@Controller('progress/orders')
@UseGuards(new AuthGuard('progress'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders(@Query(new ZodPiPe(getOrdersSchema)) query) {
    return this.ordersService.getOrders(query);
  }

  @Get(':id')
  getOrder(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.ordersService.getOrder(params);
  }
}
