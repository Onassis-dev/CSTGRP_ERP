import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './categories.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Purchases')
@Controller('purchases/categories')
@UseGuards(new AuthGuard('purchases'))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  get() {
    return this.categoriesService.findAllCategories();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.categoriesService.createCategory(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.categoriesService.editCategory(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.categoriesService.deleteCategory(body);
  }

  @Post('import')
  import(@Body() body: any) {
    return this.categoriesService.importCategories(body);
  }
}
