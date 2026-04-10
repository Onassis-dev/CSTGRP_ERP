import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { OrdersService } from './orders.service';
import { checkOrderSchema, getOrdersSchema } from './orders.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';

@Controller('reports/orders')
@UseGuards(new AuthGuard('reports_orders'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders(@Query(new ZodPiPe(getOrdersSchema)) query) {
    return this.ordersService.getOrders(query);
  }

  @Put()
  checkOrder(@Body(new ZodPiPe(checkOrderSchema)) body) {
    return this.ordersService.checkOrder(body);
  }
}
