import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './devices.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@Controller('devices')
@UseGuards(new AuthGuard('it'))
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  get() {
    return this.devicesService.findAllDevices();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.devicesService.createDevice(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.devicesService.editDevice(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.devicesService.deleteDevice(body);
  }
}
