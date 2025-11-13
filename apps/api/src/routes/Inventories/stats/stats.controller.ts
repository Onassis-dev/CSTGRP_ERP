import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Inventory Stats')
@Controller('inventorystats')
@UseGuards(new AuthGuard('inventorystats'))
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('stockwarnings')
  materialWarnings() {
    return this.statsService.getMaterialWarnings();
  }

  @Get('outofstock')
  outOfStock() {
    return this.statsService.getOutOfStock();
  }

  @Get('outofstockwithoutleftover')
  outOfStockWithoutLeftover() {
    return this.statsService.getOutOfStockWithoutLeftover();
  }

  @Get('export')
  @Header('Content-Disposition', 'attachment; filename=Reporte.xlsx')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  exportReport() {
    return this.statsService.exportReport();
  }
}
