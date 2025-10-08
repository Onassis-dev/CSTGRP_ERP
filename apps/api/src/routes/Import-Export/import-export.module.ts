import { Module } from '@nestjs/common';
import { ImportModule } from './imports/import.module';
import { ExportModule } from './exports/export.module';

@Module({
  imports: [ImportModule, ExportModule],
})
export class ImportExportModule {}
