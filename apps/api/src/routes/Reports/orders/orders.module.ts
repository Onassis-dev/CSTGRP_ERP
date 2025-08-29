import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'reports',
    },
  ],
})
export class OrdersModule {}
