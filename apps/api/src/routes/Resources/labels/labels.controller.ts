import {
  Controller,
  UseGuards,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LabelsService } from './labels.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { downloadLabelSchema } from './labels.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';

@ApiTags('Labels')
@Controller('resources/labels')
@UseGuards(new AuthGuard('labels'))
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post('get-job')
  @UseInterceptors(FileInterceptor('file'))
  getJob(@UploadedFile() file: File) {
    return this.labelsService.getJob(file);
  }

  @Post('print')
  print(@Body(new ZodPiPe(downloadLabelSchema)) body) {
    return this.labelsService.print(body);
  }
}
