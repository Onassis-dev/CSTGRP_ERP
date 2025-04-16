import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  contractSchema,
  createDocSchema,
  editDocSchema,
  getDocumentsSchema,
  idSchema,
} from './documents.schema';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';

@ApiTags('Employees Documents')
@Controller('employees/documents')
@UseGuards(new AuthGuard('employees'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':employeeId')
  getDocuments(@Param(new ZodPiPe(getDocumentsSchema)) body) {
    return this.documentsService.getDocuments(body);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(@Body() body, @UploadedFile() file: File) {
    const validatedBody = new ZodPiPe(createDocSchema).transform(
      JSON.parse(body.json),
    );
    return this.documentsService.uploadDocument(validatedBody, file);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  editDocument(@Body() body, @UploadedFile() file: File) {
    const validatedBody = new ZodPiPe(editDocSchema).transform(
      JSON.parse(body.json),
    );
    return this.documentsService.editDocument(validatedBody, file);
  }

  @Delete(':id')
  deleteDocument(@Param(new ZodPiPe(idSchema)) body) {
    return this.documentsService.deleteDocument(body);
  }

  @Get('contract/:id/:number')
  getContract(@Param(new ZodPiPe(contractSchema)) body) {
    return this.documentsService.getContract(body);
  }

  @Get('credential/:id')
  getCredential(@Param(new ZodPiPe(idSchema)) body) {
    return this.documentsService.generateImage(body);
  }
}
