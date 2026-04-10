import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [DeliveriesController],
  providers: [
    DeliveriesService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'production',
    },
  ],
})
export class DeliveriesModule {}
