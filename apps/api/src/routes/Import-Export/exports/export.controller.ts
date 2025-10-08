import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ExportService } from './export.service';
import { getExportSchema } from './export.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { idObjectSchema } from 'src/utils/schemas';

@Controller('ie/exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  async findAll(@Query(new ZodPiPe(getExportSchema)) query) {
    return this.exportService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.exportService.findOne(body);
  }

  @Delete(':id')
  async delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.exportService.delete(body);
  }
}
