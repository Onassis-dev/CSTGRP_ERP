import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { ImportService } from './import.service';

@Module({
  controllers: [ImportController],
  providers: [
    ImportService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class ImportModule {}
