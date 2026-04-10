import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { fileSchema } from './files.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { getFile } from 'src/utils/storage';

@Controller('static')
export class FilesController {
  @UseGuards(new AuthGuard('employees'))
  @Get('employees/:file')
  async employees(@Param(new ZodPiPe(fileSchema)) body) {
    return await getFile('employees', body.file);
  }

  @UseGuards(new AuthGuard('inventory'))
  @Get('inventory/:file')
  async inventory(@Param(new ZodPiPe(fileSchema)) body) {
    return await getFile('inventory', body.file);
  }
}
