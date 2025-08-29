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
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { filterSchema } from './petitions.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Material Petitions')
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

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.petitionsService.deleteRequisition(body);
  }
}
