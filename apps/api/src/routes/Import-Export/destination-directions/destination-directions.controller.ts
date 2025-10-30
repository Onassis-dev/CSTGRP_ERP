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
import { DestinationDirectionsService } from './destination-directions.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  searchDestinationDirectionSchema,
  createDestinationDirectionSchema,
  editDestinationDirectionSchema,
} from './destination-directions.schema';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('DestinationDirections')
@Controller('ie/destination-directions')
@UseGuards(new AuthGuard('ie_options'))
export class DestinationDirectionsController {
  constructor(
    private readonly destinationDirectionsService: DestinationDirectionsService,
  ) {}

  @Get('')
  get(@Query(new ZodPiPe(searchDestinationDirectionSchema)) params) {
    return this.destinationDirectionsService.get(params);
  }

  @Post('')
  post(@Body(new ZodPiPe(createDestinationDirectionSchema)) body) {
    return this.destinationDirectionsService.post(body);
  }

  @Put('')
  update(@Body(new ZodPiPe(editDestinationDirectionSchema)) body) {
    return this.destinationDirectionsService.update(body);
  }

  @Delete(':id')
  delete(@Param(new ZodPiPe(idObjectSchema)) body) {
    return this.destinationDirectionsService.delete(body);
  }
}
