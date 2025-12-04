import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { MaintenancesService } from './maintenances.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './maintenances.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Maintenances')
@Controller('maintenance/maintenances')
@UseGuards(new AuthGuard('maintenance'))
export class MaintenancesController {
  constructor(private readonly maintenancesService: MaintenancesService) {}

  @Get(':id')
  getOne(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.maintenancesService.getOne(body);
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.maintenancesService.create(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.maintenancesService.edit(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.maintenancesService.delete(body);
  }
}
