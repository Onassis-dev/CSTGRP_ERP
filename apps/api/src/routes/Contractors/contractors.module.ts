import { Module } from '@nestjs/common';
import { ProgressModule } from './progress/progress.module';
import { DeliveriesModule } from './deliveries/deliveries.module';

@Module({
  imports: [ProgressModule, DeliveriesModule],
})
export class ContractorsModule {}
