import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  createEvaluationSchema,
  getEvaluationsSchema,
  idSchema,
} from './evaluations.schema';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';

@ApiTags('Employees Evaluations')
@Controller('employees/evaluations')
@UseGuards(new AuthGuard('employees'))
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get(':employeeId')
  getEvaluations(@Param(new ZodPiPe(getEvaluationsSchema)) body) {
    return this.evaluationsService.getEvaluations(body);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadEvaluation(@Body() body, @UploadedFile() file: File) {
    const validatedBody = new ZodPiPe(createEvaluationSchema).transform(
      JSON.parse(body.json),
    );
    return this.evaluationsService.uploadEvaluation(validatedBody, file);
  }

  @Delete(':id')
  deleteEvaluation(@Param(new ZodPiPe(idSchema)) body) {
    return this.evaluationsService.deleteEvaluation(body);
  }
}
