import { Module } from '@nestjs/common';
import { StatsModule } from './stats/stats.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [StatsModule, OrdersModule],
})
export class ProductionModule {}
