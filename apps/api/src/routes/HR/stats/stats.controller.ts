import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { areaAssistanceInfoSchema, dateObjectSchema } from './stats.schema';

@ApiTags('HR Stats')
@Controller('hrstats')
@UseGuards(new AuthGuard('hr_dashboard'))
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('birthdays/:date')
  birthdays(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.birthDays(params);
  }

  @Get('weeklyfires/:date')
  weeklyFires(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.weeklyFires(params);
  }

  @Get('weeklyhires/:date')
  weeklyHires(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.weeklyHires(params);
  }

  @Get('assistance/:date')
  assistance(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.assistance(params);
  }

  @Get('dailyincidenceslist/:date')
  incidencesList(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.dailyIncidencesList(params);
  }

  @Get('assistanceinfo/:date')
  assistanceInfo(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.assistanceInfo(params);
  }

  @Get('dailyassistance/:date')
  dailyAssistance(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.dailyAssistance(params);
  }

  @Get('areaassistanceinfo')
  areaAssistanceInfo(@Query(new ZodPiPe(areaAssistanceInfoSchema)) query) {
    return this.statsService.areaAssistanceInfo(query);
  }

  @Get('employeerotation/:date')
  employeeRotation(@Param(new ZodPiPe(dateObjectSchema)) params) {
    return this.statsService.employeeRotation(params);
  }

  @Get('activeemployees')
  activeEmployees() {
    return this.statsService.activeEmployees();
  }

  @Get('employeetemplate')
  employeeTemplate() {
    return this.statsService.employeeTemplate();
  }

  @Get('contractexpiration')
  contractExpiration() {
    return this.statsService.contractExpiration();
  }
}
