import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'purchases',
    },
  ],
})
export class SuppliersModule {}
