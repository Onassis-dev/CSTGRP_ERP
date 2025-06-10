import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'purchases',
    },
  ],
})
export class ProductsModule {}
