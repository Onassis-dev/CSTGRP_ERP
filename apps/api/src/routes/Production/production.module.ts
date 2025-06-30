import { Module } from '@nestjs/common';
import { ProgressModule } from './progress/progress.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [ProgressModule, HistoryModule],
})
export class ProductionModule {}
