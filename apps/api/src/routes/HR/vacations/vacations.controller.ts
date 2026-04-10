import { Controller, Get, UseGuards, Param, Post, Body } from '@nestjs/common';
import { VacationsService } from './vacations.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { idObjectSchema } from 'src/utils/schemas';
import { createVacationSchema } from './vacations.schema';

@Controller('employees/vacations')
@UseGuards(new AuthGuard('employees'))
export class VacationsController {
  constructor(private readonly vacationsService: VacationsService) {}

  @Get(':id')
  getVacations(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.vacationsService.getVacations(params);
  }

  @Post()
  createVacation(@Body(new ZodPiPe(createVacationSchema)) body) {
    return this.vacationsService.createVacation(body);
  }
}
