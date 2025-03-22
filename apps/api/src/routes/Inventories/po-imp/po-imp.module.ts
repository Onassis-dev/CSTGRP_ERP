import { Module } from '@nestjs/common';
import { PoImpService } from './po-imp.service';
import { PoImpController } from './po-imp.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [PoImpController],
  providers: [
    PoImpService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'inventory',
    },
  ],
})
export class PoImpModule {}
