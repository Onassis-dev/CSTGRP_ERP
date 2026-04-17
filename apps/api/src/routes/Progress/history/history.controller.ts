import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { HistoryService } from './history.service';
import {
  captureProgressSchema,
  completeOrderSchema,
  updateHistorySchema,
} from './history.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { idObjectSchema } from 'src/utils/schemas';

@Controller('progress/history')
@UseGuards(new AuthGuard('progress'))
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  get(@Query(new ZodPiPe(idObjectSchema)) body) {
    return this.historyService.get(body);
  }

  @Post()
  post(@Body(new ZodPiPe(captureProgressSchema)) body) {
    return this.historyService.post(body);
  }

  @Post('complete')
  complete(@Body(new ZodPiPe(completeOrderSchema)) body) {
    return this.historyService.completeOrder(body);
  }

  @Put()
  put(@Body(new ZodPiPe(updateHistorySchema)) body) {
    return this.historyService.put(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(idObjectSchema)) body) {
    return this.historyService.delete(body);
  }
}
