import { Module } from '@nestjs/common';
import { AreasModule } from './areas/areas.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [AreasModule, OrdersModule],
})
export class ReportsModule {}
