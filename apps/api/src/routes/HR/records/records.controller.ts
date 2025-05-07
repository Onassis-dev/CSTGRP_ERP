import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { RecordsService } from './records.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  createRecordSchema,
  getEmployeeHistorySchema,
  idSchema,
} from './records.schema';

@ApiTags('Employees History')
@Controller('employees/history')
@UseGuards(new AuthGuard('employees'))
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get(':employeeId')
  getEmployeeHistory(@Param(new ZodPiPe(getEmployeeHistorySchema)) body) {
    return this.recordsService.getEmployeeHistory(body);
  }

  @Post()
  uploadRecord(@Body(new ZodPiPe(createRecordSchema)) body) {
    return this.recordsService.uploadRecord(body);
  }

  @Get('doc/:id')
  downloadDoc(@Param(new ZodPiPe(idSchema)) body) {
    return this.recordsService.downloadDoc(body);
  }
}
