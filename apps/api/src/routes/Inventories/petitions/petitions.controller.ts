import {
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PetitionsService } from './petitions.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { downloadMultipleSchema, filterSchema } from './petitions.schema';
import { idObjectSchema } from 'src/utils/schemas';

@Controller('petitions')
@UseGuards(new AuthGuard('petitions'))
export class PetitionsController {
  constructor(private readonly petitionsService: PetitionsService) {}

  @Get('')
  getPetitions(@Query(new ZodPiPe(filterSchema)) params) {
    return this.petitionsService.getPetitions(params);
  }

  @Get('/download/:id')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="requisicion.pdf"')
  download(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.petitionsService.download(params);
  }

  @Get('/download-multiple')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="requisicion.pdf"')
  downloadMultiple(@Query(new ZodPiPe(downloadMultipleSchema)) params) {
    return this.petitionsService.downloadMultiple(params);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.petitionsService.deleteRequisition(body);
  }
}
