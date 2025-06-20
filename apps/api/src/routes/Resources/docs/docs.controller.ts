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
import { DocsService } from './docs.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getDocSchema,
} from './docs.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Docs')
@Controller('resources/docs')
@UseGuards(new AuthGuard('docs'))
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  get() {
    return this.docsService.findAllDocs();
  }

  @Get('one')
  getDoc(@Query(new ZodPiPe(getDocSchema)) body) {
    return this.docsService.getDoc(body);
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.docsService.createDoc(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.docsService.editDoc(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.docsService.deleteDoc(body);
  }
}
