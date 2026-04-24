import { Module } from '@nestjs/common';
import { AreasModule } from './areas/areas.module';
import { PositionsModule } from './positions/positions.module';
import { ClientsModule } from './clients/clients.module';
import { ContractorsModule } from './contractors/contractors.module';
import { ContractorsPricesModule } from './contractorPrices/contractorsPrices.module';

@Module({
  imports: [
    AreasModule,
    PositionsModule,
    ClientsModule,
    ContractorsModule,
    ContractorsPricesModule,
  ],
})
export class StructureModule {}
