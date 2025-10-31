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
import { ShipToService } from './ship-to.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  searchShipToSchema,
  createShipToSchema,
  editShipToSchema,
} from './ship-to.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('ShipTo')
@Controller('ie/ship-to')
@UseGuards(new AuthGuard('ie_options'))
export class ShipToController {
  constructor(
    private readonly shipToService: ShipToService,
  ) {}

  @Get('')
  get(@Query(new ZodPiPe(searchShipToSchema)) params) {
    return this.shipToService.get(params);
  }

  @Post('')
  post(@Body(new ZodPiPe(createShipToSchema)) body) {
    return this.shipToService.post(body);
  }

  @Put('')
  update(@Body(new ZodPiPe(editShipToSchema)) body) {
    return this.shipToService.update(body);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.shipToService.delete(body);
  }
}

