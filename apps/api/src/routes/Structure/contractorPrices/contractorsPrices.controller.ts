import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { ContractorsPricesService } from './contractorsPrices.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getSchema,
} from './contractorsPrices.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@Controller('contractors-prices')
@UseGuards(new AuthGuard('structure'))
export class ContractorsPricesController {
  constructor(
    private readonly contractorsPricesService: ContractorsPricesService,
  ) {}

  @Get()
  get(@Query(new ZodPiPe(getSchema)) query) {
    return this.contractorsPricesService.findAll(query);
  }

  @Post()
  create(@Body(new ZodPiPe(createSchema)) body) {
    return this.contractorsPricesService.create(body);
  }

  @Put()
  update(@Body(new ZodPiPe(editSchema)) body) {
    return this.contractorsPricesService.edit(body);
  }

  @Delete()
  remove(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.contractorsPricesService.delete(body);
  }
}
