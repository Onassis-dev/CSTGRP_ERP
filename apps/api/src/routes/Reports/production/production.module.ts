import { Module } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [ProductionController],
  providers: [
    ProductionService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'production',
    },
  ],
})
export class ProductionModule {}
