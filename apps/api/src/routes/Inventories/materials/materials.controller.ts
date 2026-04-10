import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './materials.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';

@Controller('materials')
@UseGuards(new AuthGuard('inventory'))
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  get() {
    return this.materialsService.findAllMaterials();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  register(@Body() body, @UploadedFile() file: File) {
    const validatedBody = new ZodPiPe(createSchema).transform(
      JSON.parse(body.json),
    );
    return this.materialsService.createMaterial(validatedBody, file);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  edit(@Body() body, @UploadedFile() file: File) {
    const validatedBody = new ZodPiPe(editSchema).transform(
      JSON.parse(body.json),
    );
    return this.materialsService.editMaterial(validatedBody, file);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.materialsService.deleteMaterial(body);
  }
}
