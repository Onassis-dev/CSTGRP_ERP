import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { HistoryService } from './history.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { getHistorySchema } from './history.schema';

@ApiTags('Reports History')
@Controller('reports/history')
@UseGuards(new AuthGuard('reports_history'))
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  get(@Query(new ZodPiPe(getHistorySchema)) body) {
    return this.historyService.get(body);
  }
}
