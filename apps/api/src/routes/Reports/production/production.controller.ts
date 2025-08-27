import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ProductionService } from './production.service';
import {
  checkOrderSchema,
  getAreasSchema,
  getOrdersSchema,
} from './production.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';

@ApiTags('Reports')
@Controller('reports/production')
@UseGuards(new AuthGuard('reports'))
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('orders')
  getOrders(@Query(new ZodPiPe(getOrdersSchema)) query) {
    return this.productionService.getOrders(query);
  }

  @Get('areas')
  getAreas(@Query(new ZodPiPe(getAreasSchema)) query) {
    return this.productionService.getAreas(query);
  }

  @Put('orders')
  checkOrder(@Body(new ZodPiPe(checkOrderSchema)) body) {
    return this.productionService.checkOrder(body);
  }
}
