import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createPassSchema,
  editPassSchema,
  getJobsSchema,
  getPassesSchema,
} from './exitPass.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ExitPassService } from './exitPass.service';
import { idObjectSchema } from 'src/utils/schemas';

@Controller('contractors/exit-pass')
@UseGuards(new AuthGuard('contractors_exitPass'))
export class ExitPassController {
  constructor(private readonly exitPassService: ExitPassService) {}

  @Get('')
  getAll(@Query(new ZodPiPe(getPassesSchema)) query) {
    return this.exitPassService.getAll(query);
  }

  @Post('')
  createOrEdit(@Body(new ZodPiPe(createPassSchema)) body) {
    return this.exitPassService.createOrEdit(body);
  }

  @Put('')
  edit(@Body(new ZodPiPe(editPassSchema)) body) {
    return this.exitPassService.createOrEdit(body, true);
  }

  @Delete('')
  delete(@Body(new ZodPiPe(idObjectSchema)) body) {
    return this.exitPassService.delete(body);
  }

  @Get('available-jobs')
  getJobs(@Query(new ZodPiPe(getJobsSchema)) query) {
    return this.exitPassService.getJobs(query);
  }

  @Get(':id/jobs')
  getJobsForPass(@Param('id') id: string) {
    const exitId = Number(id);
    if (!Number.isInteger(exitId) || exitId <= 0) {
      throw new BadRequestException('Id invalido');
    }
    return this.exitPassService.getJobsForExitPass(exitId);
  }

  @Get('/download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="salida-contratista.pdf"')
  download(@Query(new ZodPiPe(idObjectSchema)) params) {
    return this.exitPassService.download(params);
  }
}
