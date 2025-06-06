import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [CategoriesModule, ProductsModule, SuppliersModule, OrdersModule],
})
export class PurchasesModule {}
