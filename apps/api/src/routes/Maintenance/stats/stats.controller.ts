import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Maintenance Stats')
@Controller('maintenance/stats')
@UseGuards(new AuthGuard('maintenance'))
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  get() {
    return this.statsService.get();
  }
}
