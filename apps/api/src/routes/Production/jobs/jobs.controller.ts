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
import { JobsService } from './jobs.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { exportSchema, IEFilterSchema } from './jobs.schema';
import { updateExportSchema } from './jobs.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(new AuthGuard('jobs'))
export class JobsController {
  constructor(private readonly poImpService: JobsService) {}
  @Get('comparison/:id')
  getComparison(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.poImpService.getComparison(params);
  }

  @Get('')
  get(@Query(new ZodPiPe(IEFilterSchema)) params) {
    return this.poImpService.get(params);
  }

  @Get(':id')
  getOne(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.poImpService.getOne(params);
  }

  @Post('')
  post(@Body(new ZodPiPe(exportSchema)) body) {
    return this.poImpService.post(body);
  }

  @Put('')
  update(@Body(new ZodPiPe(updateExportSchema)) body) {
    return this.poImpService.update(body);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.poImpService.delete(body);
  }
}
