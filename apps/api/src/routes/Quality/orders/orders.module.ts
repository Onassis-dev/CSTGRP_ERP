import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'quality',
    },
  ],
})
export class OrdersModule {}
