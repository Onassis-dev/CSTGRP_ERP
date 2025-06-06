import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  deleteSchema,
  editSchema,
  createSchema,
  searchSchema,
} from './suppliers.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Suppliers')
@Controller('purchases/suppliers')
@UseGuards(new AuthGuard('purchases'))
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  get(@Query(new ZodPiPe(searchSchema)) body) {
    return this.suppliersService.findAllSuppliers(body);
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.suppliersService.createSupplier(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.suppliersService.editSupplier(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.suppliersService.deleteSupplier(body);
  }
}
