import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { ApiTags } from '@nestjs/swagger';
import { File, FileInterceptor } from '@nest-lab/fastify-multer';

@ApiTags('Functions')
@Controller('functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @Post('zenpet')
  @UseInterceptors(FileInterceptor('file'))
  zenpet(@UploadedFile() file: File) {
    return this.functionsService.zenpet(file);
  }
}
