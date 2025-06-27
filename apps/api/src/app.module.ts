import { Module } from '@nestjs/common';
import { GeneralModule } from './routes/General/general.module';
import { HRModule } from './routes/HR/hr.module';
import { StructureModule } from './routes/Structure/structure.module';
import { InventoriesModule } from './routes/Inventories/inventories.module';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { ITModule } from './routes/IT/it.module';
import { ResourcesModule } from './routes/Resources/resources.module';
import { PurchasesModule } from './routes/Purchases/purchases.module';
import { ProductionModule } from './routes/Production/production.module';

@Module({
  imports: [
    FastifyMulterModule,
    GeneralModule,
    HRModule,
    StructureModule,
    InventoriesModule,
    ITModule,
    ResourcesModule,
    PurchasesModule,
    ProductionModule,
  ],
})
export class AppModule {}
