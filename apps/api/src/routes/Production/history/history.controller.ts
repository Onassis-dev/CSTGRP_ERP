import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiTags } from '@nestjs/swagger';
import { getHistorySchema, updateHistorySchema } from './history.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('History')
@Controller('prod-history')
@UseGuards(new AuthGuard('prodmovements'))
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('')
  getOrders(@Query(new ZodPiPe(getHistorySchema)) query) {
    return this.historyService.getOrders(query);
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
