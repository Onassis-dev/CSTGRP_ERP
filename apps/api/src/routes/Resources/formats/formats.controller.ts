import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  createFormatSchema,
  editFolderSchema,
  editFormatSchema,
  folderSchema,
  formatNameSchema,
  nameSchema,
} from './formats.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { FormatsService } from './formats.service';
import { File, FileInterceptor } from '@nest-lab/fastify-multer';

@ApiTags('Formats')
@Controller('resources/formats')
@UseGuards(new AuthGuard('formats'))
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get()
  getFormats(@Query(new ZodPiPe(folderSchema)) params) {
    return this.formatsService.getFormats(params);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createFormat(
    @Body(new ZodPiPe(createFormatSchema)) body,
    @UploadedFile() file: File,
  ) {
    return this.formatsService.createFormat(body, file);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  editFormat(
    @Body(new ZodPiPe(editFormatSchema)) body,
    @UploadedFile() file: File,
  ) {
    return this.formatsService.editFormat(body, file);
  }

  @Delete()
  deleteFormat(@Body(new ZodPiPe(formatNameSchema)) body) {
    return this.formatsService.deleteFormat(body);
  }

  @Get('download')
  download(@Query(new ZodPiPe(formatNameSchema)) params) {
    return this.formatsService.download(params);
  }

  @Get('folders')
  getFolders() {
    return this.formatsService.getFolders();
  }

  @Post('folder')
  createFolder(@Body(new ZodPiPe(nameSchema)) body) {
    return this.formatsService.createFolder(body);
  }

  @Put('folder')
  editFolder(@Body(new ZodPiPe(editFolderSchema)) body) {
    return this.formatsService.editFolder(body);
  }

  @Delete('folder')
  deleteFolder(@Body(new ZodPiPe(nameSchema)) body) {
    return this.formatsService.deleteFolder(body);
  }
}
