import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [RecordsController],
  providers: [
    RecordsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'hr',
    },
  ],
})
export class RecordsModule {}
