import { Controller, Get, Body, UseGuards, Put, Param } from '@nestjs/common';
import { ProductivityService } from './productivity.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { editSchema, weekSchema } from './productivity.schema';

@Controller('productivity')
@UseGuards(new AuthGuard('productivity'))
export class ProductivityController {
  constructor(private readonly employeesService: ProductivityService) {}

  @Get(':date')
  getWeek(@Param(new ZodPiPe(weekSchema)) params) {
    return this.employeesService.getWeek(params);
  }

  @Put()
  editSingle(@Body(new ZodPiPe(editSchema)) body) {
    return this.employeesService.editSingle(body);
  }
}
