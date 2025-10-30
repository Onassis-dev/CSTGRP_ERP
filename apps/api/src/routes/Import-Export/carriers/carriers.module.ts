import { Module } from '@nestjs/common';
import { CarriersController } from './carriers.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { CarriersService } from './carriers.service';

@Module({
  controllers: [CarriersController],
  providers: [
    CarriersService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class CarriersModule {}
