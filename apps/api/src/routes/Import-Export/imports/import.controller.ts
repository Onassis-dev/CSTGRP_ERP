import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ImportService } from './import.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  IEFilterSchema,
  importSchema,
  updateImportSchema,
} from './import.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Import')
@Controller('ie/imports')
@UseGuards(new AuthGuard('imports'))
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Get('')
  get(@Query(new ZodPiPe(IEFilterSchema)) params) {
    return this.importService.get(params);
  }

  @Get(':id')
  getOne(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.importService.getOne(params);
  }

  @Post('import')
  post(@Body(new ZodPiPe(importSchema)) body) {
    return this.importService.post(body);
  }

  @Put('import')
  update(@Body(new ZodPiPe(updateImportSchema)) body) {
    return this.importService.update(body);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.importService.delete(body);
  }
}
