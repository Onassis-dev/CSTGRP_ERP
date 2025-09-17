import { Module } from '@nestjs/common';
import { ProgressModule } from './progress/progress.module';
import { HistoryModule } from './history/history.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [ProgressModule, HistoryModule, JobsModule],
})
export class ProductionModule {}
