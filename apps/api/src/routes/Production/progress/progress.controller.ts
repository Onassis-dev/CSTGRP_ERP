import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ApiTags } from '@nestjs/swagger';
import {
  captureProgressSchema,
  getHistorySchema,
  getProgressSchema,
} from './progress.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(new AuthGuard())
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('')
  getOrders(@Query(new ZodPiPe(getProgressSchema)) query) {
    return this.progressService.getOrders(query);
  }

  @Get('history')
  getOrderHistory(@Query(new ZodPiPe(getHistorySchema)) query) {
    return this.progressService.getOrderHistory(query);
  }

  @Post('')
  captureDailyProgress(@Body(new ZodPiPe(captureProgressSchema)) body) {
    return this.progressService.captureDailyProgress(body);
  }
}
