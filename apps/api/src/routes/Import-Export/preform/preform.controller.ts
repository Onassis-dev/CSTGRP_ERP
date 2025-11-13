import {
  Body,
  Controller,
  Get,
  Header,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { PreformService } from './preform.service';
import { downloadPreformSchema, editPreformSchema } from './preform.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Preform')
@Controller('ie/preform')
@UseGuards(new AuthGuard('exports'))
export class PreformController {
  constructor(private readonly preformService: PreformService) {}

  @Get('options')
  getOptions() {
    return this.preformService.getOptions();
  }

  @Get('data')
  getData(@Query(new ZodPiPe(idObjectSchema)) params) {
    return this.preformService.getData(params);
  }

  @Get('download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="preform.pdf"')
  download(@Query(new ZodPiPe(downloadPreformSchema)) params) {
    return this.preformService.download(params);
  }

  @Put('')
  update(@Body(new ZodPiPe(editPreformSchema)) body) {
    return this.preformService.update(body);
  }
}
