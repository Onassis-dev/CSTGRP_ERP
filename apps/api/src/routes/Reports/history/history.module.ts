import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [HistoryController],
  providers: [
    HistoryService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'reports',
    },
  ],
})
export class HistoryModule {}
