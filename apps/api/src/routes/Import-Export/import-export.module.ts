import { Module } from '@nestjs/common';
import { ImportModule } from './imports/import.module';

@Module({
  imports: [ImportModule],
})
export class ImportExportModule {}
