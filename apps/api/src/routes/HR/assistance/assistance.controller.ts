import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Query,
} from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { editSchema, weekSchema } from './assistance.schema';

@Controller('assistance')
@UseGuards(new AuthGuard('assistance'))
export class AssistanceController {
  constructor(private readonly employeesService: AssistanceService) {}

  @Get('week/:date')
  getWeek(@Param(new ZodPiPe(weekSchema)) params) {
    return this.employeesService.getWeek(params);
  }

  @Get('single/:id')
  getSingle(@Param(new ZodPiPe(weekSchema)) params) {
    return this.employeesService.getSingle(params);
  }

  @Post()
  createWeek(@Body(new ZodPiPe(weekSchema)) body) {
    return this.employeesService.createWeek(body);
  }

  @Put()
  editSingle(@Body(new ZodPiPe(editSchema)) body) {
    return this.employeesService.editSingle(body);
  }

  @Get('export')
  export(@Query(new ZodPiPe(weekSchema)) query) {
    return this.employeesService.export(query);
  }
}
