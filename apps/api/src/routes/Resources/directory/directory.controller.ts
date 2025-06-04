import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { DirectoryService } from './directory.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './directory.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Directory')
@Controller('resources/directory')
@UseGuards(new AuthGuard('directory'))
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get()
  get() {
    return this.directoryService.findAllDirectory();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.directoryService.createEmail(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.directoryService.editEmail(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.directoryService.deleteEmail(body);
  }

  @Get('options')
  getOptions() {
    return this.directoryService.getOptions();
  }
}
