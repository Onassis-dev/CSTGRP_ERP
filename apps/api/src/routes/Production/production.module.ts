import { Module } from '@nestjs/common';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [ProgressModule],
})
export class ProductionModule {}
