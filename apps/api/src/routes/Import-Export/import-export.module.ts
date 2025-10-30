import { Module } from '@nestjs/common';
import { ImportModule } from './imports/import.module';
import { ExportModule } from './exports/export.module';
import { CarriersModule } from './carriers/carriers.module';
import { DestinationDirectionsModule } from './destination-directions/destination-directions.module';
import { ShippersModule } from './shippers/shippers.module';
import { PackingListModule } from './packing-list/packing-list.module';

@Module({
  imports: [
    ImportModule,
    ExportModule,
    CarriersModule,
    DestinationDirectionsModule,
    ShippersModule,
    PackingListModule,
  ],
})
export class ImportExportModule {}
