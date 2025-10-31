import { Module } from '@nestjs/common';
import { ImportModule } from './imports/import.module';
import { ExportModule } from './exports/export.module';
import { CarriersModule } from './carriers/carriers.module';
import { DestinationDirectionsModule } from './destination-directions/destination-directions.module';
import { ShipToModule } from './ship-to/ship-to.module';
import { ShippersModule } from './shippers/shippers.module';
import { PackingListModule } from './packing-list/packing-list.module';

@Module({
  imports: [
    ImportModule,
    ExportModule,
    CarriersModule,
    DestinationDirectionsModule,
    ShipToModule,
    ShippersModule,
    PackingListModule,
  ],
})
export class ImportExportModule {}
