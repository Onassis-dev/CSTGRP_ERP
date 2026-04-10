import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './areas.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@Controller('areas')
@UseGuards(new AuthGuard('structure'))
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  get() {
    return this.areasService.findAllAreas();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.areasService.createArea(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.areasService.editArea(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.areasService.deleteArea(body);
  }
}
