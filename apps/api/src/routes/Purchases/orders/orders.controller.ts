import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getProductsSchema,
} from './orders.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Purchases')
@Controller('purchases/orders')
@UseGuards(new AuthGuard('purchases'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  get() {
    return this.ordersService.findAllOrders();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.ordersService.createOrder(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.ordersService.editOrder(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.ordersService.deleteOrder(body);
  }

  @Get('basic-data')
  getBasicData() {
    return this.ordersService.getBasicData();
  }

  @Get('products')
  getProducts(@Query(new ZodPiPe(getProductsSchema)) body) {
    return this.ordersService.getProducts(body);
  }
}
