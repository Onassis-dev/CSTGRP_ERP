import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [OrdersModule, HistoryModule],
})
export class ProgressModule {}
