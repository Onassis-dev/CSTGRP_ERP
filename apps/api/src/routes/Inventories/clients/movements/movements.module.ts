import { Module } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [MovementsController],
  providers: [
    MovementsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: '',
    },
  ],
})
export class ClientMovementsModule {}
