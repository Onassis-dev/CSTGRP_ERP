import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VariousService } from './various.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Inventory various')
@Controller('inventoryvarious')
@UseGuards(new AuthGuard())
export class VariousController {
  constructor(private readonly variousService: VariousService) {}

  @Get('measurement')
  getMeasurement(@Query() query) {
    return this.variousService.getMeasurement(query);
  }

  @Get('materials')
  getMaterials() {
    return this.variousService.getMaterials();
  }

  @Get('clients-legal')
  getClientsLegal() {
    return this.variousService.getClientsLegal();
  }

  @Get('clients')
  getClients() {
    return this.variousService.getClients();
  }

  @Get('areas')
  getAreas() {
    return this.variousService.getAreas();
  }

  @Get('products')
  getProducts() {
    return this.variousService.getProducts();
  }

  @Post('exportxlsx')
  @UseInterceptors(FileInterceptor('file'))
  convertExcel(@UploadedFile() file: File) {
    return this.variousService.convertExcel(file);
  }

  @Post('jobpdf')
  @UseInterceptors(FileInterceptor('file'))
  convertJob(@UploadedFile() file: File) {
    return this.variousService.convertJobPdf(file);
  }

  @Post('importpdf')
  @UseInterceptors(FileInterceptor('file'))
  convertImport(@UploadedFile() file: File) {
    return this.variousService.convertImportPdf(file);
  }
}
