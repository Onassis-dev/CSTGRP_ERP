import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiTags } from '@nestjs/swagger';
import {
  getHistorySchema,
  getMovementsSchema,
  updateHistorySchema,
} from './history.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('History')
@Controller('prod-history')
@UseGuards(new AuthGuard('prodmovements'))
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('')
  getOrders(@Query(new ZodPiPe(getHistorySchema)) body) {
    return this.historyService.getOrders(body);
  }

  @Get(':id')
  getMovements(@Param(new ZodPiPe(getMovementsSchema)) body) {
    return this.historyService.getMovements(body);
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
