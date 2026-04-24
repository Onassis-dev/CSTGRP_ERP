import { Module } from '@nestjs/common';
import { ProgressModule } from './progress/progress.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { ExitPassModule } from './exitPass/exitPass.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [ProgressModule, DeliveriesModule, ExitPassModule, PaymentsModule],
})
export class ContractorsModule {}
