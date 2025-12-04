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
import { MachinesService } from './machines.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getMachinesSchema,
} from './machines.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Machines')
@Controller('maintenance/machines')
@UseGuards(new AuthGuard('maintenance'))
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  get(@Query(new ZodPiPe(getMachinesSchema)) query) {
    return this.machinesService.findAll(query);
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.machinesService.create(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.machinesService.edit(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.machinesService.delete(body);
  }
}
