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
import { ShippersService } from './shippers.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  searchShipperSchema,
  createShipperSchema,
  editShipperSchema,
} from './shippers.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Shippers')
@Controller('ie/shippers')
@UseGuards(new AuthGuard('ie_options'))
export class ShippersController {
  constructor(private readonly shippersService: ShippersService) {}

  @Get('')
  get(@Query(new ZodPiPe(searchShipperSchema)) params) {
    return this.shippersService.get(params);
  }

  @Post('')
  post(@Body(new ZodPiPe(createShipperSchema)) body) {
    return this.shippersService.post(body);
  }

  @Put('')
  update(@Body(new ZodPiPe(editShipperSchema)) body) {
    return this.shippersService.update(body);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.shippersService.delete(body);
  }
}
