import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'production',
    },
  ],
})
export class PaymentsModule {}
