import { Module } from '@nestjs/common';
import { ShipToController } from './ship-to.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { ShipToService } from './ship-to.service';

@Module({
  controllers: [ShipToController],
  providers: [
    ShipToService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class ShipToModule {}

