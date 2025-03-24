import { Controller, Get, Header, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { idSchema } from './inventory.schema';

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
  getMaterialMovements(@Param(new ZodPiPe(idSchema)) params) {
    return this.inventoryService.getMaterialMovements(params);
  }

  @Get('history/download/:id')
  exportMaterialMovements(@Param(new ZodPiPe(idSchema)) params) {
    return this.inventoryService.exportMaterialmMovements(params);
  }

  @Get('comparison/:id')
  getMaterialComparison(@Param(new ZodPiPe(idSchema)) params) {
    return this.inventoryService.getMaterialComparison(params);
  }

  @Get('export')
  @Header('Content-Disposition', 'attachment; filename=Inventario.xlsx')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  export() {
    return this.inventoryService.export();
  }
}
