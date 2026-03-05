import { Module } from '@nestjs/common';
import { VacationsService } from './vacations.service';
import { VacationsController } from './vacations.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [VacationsController],
  providers: [
    VacationsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'hr',
    },
  ],
})
export class VacationsModule {}
