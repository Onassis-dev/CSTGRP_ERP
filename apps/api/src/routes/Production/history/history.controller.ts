import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiTags } from '@nestjs/swagger';
import { updateHistorySchema } from './history.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('History')
@Controller('prod-history')
@UseGuards(new AuthGuard('prodmovements'))
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('')
  getOrders() {
    return this.historyService.getOrders();
  }

  @Put('')
  updateHistory(@Body(new ZodPiPe(updateHistorySchema)) body) {
    return this.historyService.updateHistory(body);
  }

  @Delete('')
  deleteHistory(@Body(new ZodPiPe(idObjectSchema)) body) {
    return this.historyService.deleteHistory(body);
  }
}
