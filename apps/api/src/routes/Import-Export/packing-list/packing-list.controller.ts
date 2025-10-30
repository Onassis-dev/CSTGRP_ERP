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
import { PackingListService } from './packing-list.service';
import {
  downloadPackingListSchema,
  editPackingListSchema,
} from './packing-list.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('PackingList')
@Controller('ie/packing-list')
@UseGuards(new AuthGuard('exports'))
export class PackingListController {
  constructor(private readonly packingListService: PackingListService) {}

  @Get('options')
  getOptions() {
    return this.packingListService.getOptions();
  }

  @Get('data')
  getData(@Query(new ZodPiPe(idObjectSchema)) params) {
    return this.packingListService.getData(params);
  }

  @Get('download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="packing-list.pdf"')
  download(@Query(new ZodPiPe(downloadPackingListSchema)) params) {
    return this.packingListService.download(params);
  }

  @Put('')
  update(@Body(new ZodPiPe(editPackingListSchema)) body) {
    return this.packingListService.update(body);
  }
}
