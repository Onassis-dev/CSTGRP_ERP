import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { idSchema, filterSchema, progressSchema } from './orders.schema';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(new AuthGuard('production'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('')
  getOrders(@Query(new ZodPiPe(filterSchema)) params) {
    return this.ordersService.getOrders(params);
  }

  @Get(':id')
  getOne(@Param(new ZodPiPe(idSchema)) params) {
    return this.ordersService.getOne(params);
  }

  @Post('progress')
  postProgress(@Body(new ZodPiPe(progressSchema)) body) {
    return this.ordersService.postProgress(body);
  }
}
