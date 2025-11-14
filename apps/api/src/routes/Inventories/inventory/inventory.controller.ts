import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { idObjectSchema } from 'src/utils/schemas';
import { exportHistorySchema } from './inventory.schema';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(new AuthGuard('inventory'))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  get() {
    return this.inventoryService.getInventory();
  }

  @Get('history/:id')
  getMaterialMovements(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.inventoryService.getMaterialMovements(params);
  }

  @Get('history/download/:id')
  exportMaterialMovements(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.inventoryService.exportMaterialmMovements(params);
  }

  @Get('comparison/:id')
  getMaterialComparison(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.inventoryService.getMaterialComparison(params);
  }

  @Get('export')
  export() {
    return this.inventoryService.export();
  }

  @Get('export-history')
  exportHistory(@Query(new ZodPiPe(exportHistorySchema)) query) {
    return this.inventoryService.exportHistory(query);
  }
}
