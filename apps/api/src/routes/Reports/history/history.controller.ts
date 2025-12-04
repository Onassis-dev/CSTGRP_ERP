import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { HistoryService } from './history.service';

@ApiTags('Reports History')
@Controller('reports/history')
@UseGuards(new AuthGuard('reports_history'))
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  get() {
    return this.historyService.get();
  }
}
