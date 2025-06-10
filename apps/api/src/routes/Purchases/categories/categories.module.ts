import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'purchases',
    },
  ],
})
export class CategoriesModule {}
