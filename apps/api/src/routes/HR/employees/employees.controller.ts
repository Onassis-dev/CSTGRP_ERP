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
import { EmployeesService } from './employees.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  createSchema,
  editSchema,
  idSchema,
  quitSchema,
  reactivateSchema,
  templateSchema,
} from './employees.schema';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(new AuthGuard('employees'))
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  getActive() {
    return this.employeesService.getActiveEmployees();
  }

  @Get(':id')
  getEmployee(@Param(new ZodPiPe(idSchema)) params) {
    return this.employeesService.getEmployee(params);
  }

  @Get('assistance/:id')
  getAssistance(@Param(new ZodPiPe(idSchema)) params) {
    return this.employeesService.getAssistance(params);
  }

  @Get('productivity/:id')
  getProductivity(@Param(new ZodPiPe(idSchema)) params) {
    return this.employeesService.getProductivity(params);
  }

  @Get('inactive')
  getInactive() {
    return this.employeesService.getInactiveEmployees();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() body, @UploadedFile() file: File) {
    const validatedBody = new ZodPiPe(createSchema).transform(
      JSON.parse(body.json),
    );
    return this.employeesService.registerEmployee(validatedBody, file);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  edit(@Body() body, @UploadedFile() file: File) {
    const validatedBody = new ZodPiPe(editSchema).transform(
      JSON.parse(body.json),
    );
    return this.employeesService.editEmployee(validatedBody, file);
  }

  @Put('reactivate')
  reActivate(@Body(new ZodPiPe(reactivateSchema)) body) {
    return this.employeesService.reactivateEmployee(body);
  }

  @Delete()
  Quit(@Body(new ZodPiPe(quitSchema)) body) {
    return this.employeesService.quitEmployee(body);
  }

  @Put('template')
  updateTemplate(@Body(new ZodPiPe(templateSchema)) body) {
    return this.employeesService.updateTemplate(body);
  }

  @Get('export')
  export() {
    return this.employeesService.export();
  }

  @Get('export-basic')
  exportBasic() {
    return this.employeesService.exportBasic();
  }
}
