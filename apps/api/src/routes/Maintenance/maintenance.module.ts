import { Module } from '@nestjs/common';
import { MachinesModule } from './machines/machines.module';
import { MaintenancesModule } from './maintenances/maintenances.module';

@Module({
  imports: [MachinesModule, MaintenancesModule],
})
export class MaintenanceModule {}
