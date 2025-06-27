import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Put,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  createRecordSchema,
  editDocSchema,
  getEmployeeHistorySchema,
} from './records.schema';
import { idObjectSchema } from 'src/utils/schemas';

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

  @Get('download-doc/:id')
  downloadDoc(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.recordsService.downloadDoc(body);
  }

  @Get('doc/:id')
  getDocData(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.recordsService.getDocData(body);
  }

  @Put('doc')
  updateDocData(@Body(new ZodPiPe(editDocSchema)) body) {
    return this.recordsService.updateDocData(body);
  }
}
