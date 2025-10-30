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
import { CarriersService } from './carriers.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  searchCarrierSchema,
  createCarrierSchema,
  editCarrierSchema,
} from './carriers.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Carriers')
@Controller('ie/carriers')
@UseGuards(new AuthGuard('ie_options'))
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Get('')
  get(@Query(new ZodPiPe(searchCarrierSchema)) params) {
    return this.carriersService.get(params);
  }

  @Post('')
  post(@Body(new ZodPiPe(createCarrierSchema)) body) {
    return this.carriersService.post(body);
  }

  @Put('')
  update(@Body(new ZodPiPe(editCarrierSchema)) body) {
    return this.carriersService.update(body);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.carriersService.delete(body);
  }
}
