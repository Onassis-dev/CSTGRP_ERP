import {
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
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { PreformService } from './preform.service';
import { createPreformSchema, editPreformSchema } from './preform.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Preform')
@Controller('ie/preforms')
@UseGuards(new AuthGuard('ie_options'))
export class PreformController {
  constructor(private readonly preformService: PreformService) {}

  @Get('')
  get() {
    return this.preformService.get();
  }

  @Get(':id')
  getOne(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.preformService.getOne(params);
  }

  @Post('')
  post(@Body(new ZodPiPe(createPreformSchema)) body) {
    return this.preformService.post(body);
  }

  @Put('')
  put(@Body(new ZodPiPe(editPreformSchema)) body) {
    return this.preformService.put(body);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.preformService.delete(params);
  }

  @Get('download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="preform.pdf"')
  download(@Query(new ZodPiPe(idObjectSchema)) params) {
    return this.preformService.download(params);
  }
}
