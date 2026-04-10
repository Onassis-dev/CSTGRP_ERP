import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './positions.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@Controller('positions')
@UseGuards(new AuthGuard('structure'))
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  get() {
    return this.positionsService.findAllPositions();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.positionsService.createPosition(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.positionsService.editPosition(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.positionsService.deletePosition(body);
  }
}
