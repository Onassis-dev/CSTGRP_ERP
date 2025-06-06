import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './products.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Products')
@Controller('purchases/products')
@UseGuards(new AuthGuard('purchases'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  get() {
    return this.productsService.findAllProducts();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.productsService.createProduct(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.productsService.editProduct(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.productsService.deleteProduct(body);
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }
}
