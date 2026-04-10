import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './contractors.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@Controller('contractors-list')
@UseGuards(new AuthGuard('structure'))
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Get()
  get() {
    return this.contractorsService.findAllContractors();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.contractorsService.createContractor(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.contractorsService.editContractor(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.contractorsService.deleteContractor(body);
  }
}
