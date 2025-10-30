import { Module } from '@nestjs/common';
import { ShippersController } from './shippers.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { ShippersService } from './shippers.service';

@Module({
  controllers: [ShippersController],
  providers: [
    ShippersService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class ShippersModule {}
