import { Module } from '@nestjs/common';
import { MachinesModule } from './machines/machines.module';
import { MaintenancesModule } from './maintenances/maintenances.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [MachinesModule, MaintenancesModule, StatsModule],
})
export class MaintenanceModule {}
