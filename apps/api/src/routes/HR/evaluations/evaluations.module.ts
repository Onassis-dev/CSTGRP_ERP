import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [EvaluationsController],
  providers: [
    EvaluationsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'hr',
    },
  ],
})
export class EvaluationsModule {}
