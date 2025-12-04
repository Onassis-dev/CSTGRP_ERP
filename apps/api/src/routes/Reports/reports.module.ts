import { Module } from '@nestjs/common';
import { AreasModule } from './areas/areas.module';
import { OrdersModule } from './orders/orders.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [AreasModule, OrdersModule, HistoryModule],
})
export class ReportsModule {}
