import { Module } from '@nestjs/common';
import { InventoryModule } from './inventory/inventory.module';
import { MaterialsModule } from './materials/materials.module';
import { VariousModule } from './various/various.module';
import { MovementsModule } from './movements/movements.module';
import { StatsModule } from './stats/stats.module';
import { RequisitionsModule } from './requisitions/requsitions.module';
import { PetitionsModule } from './petitions/petitions.module';
import { ClientMovementsModule } from './clients/movements/movements.module';

@Module({
  imports: [
    InventoryModule,
    MaterialsModule,
    VariousModule,
    MovementsModule,
    StatsModule,
    RequisitionsModule,
    ClientMovementsModule,
    PetitionsModule,
  ],
})
export class InventoriesModule {}
