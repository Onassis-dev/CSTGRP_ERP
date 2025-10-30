import { Module } from '@nestjs/common';
import { DestinationDirectionsController } from './destination-directions.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { DestinationDirectionsService } from './destination-directions.service';

@Module({
  controllers: [DestinationDirectionsController],
  providers: [
    DestinationDirectionsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class DestinationDirectionsModule {}
