import { Module } from '@nestjs/common';
import { AreasModule } from './areas/areas.module';
import { PositionsModule } from './positions/positions.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [AreasModule, PositionsModule, ClientsModule],
})
export class StructureModule {}
