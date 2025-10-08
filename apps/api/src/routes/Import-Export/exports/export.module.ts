import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { ExportService } from './export.service';

@Module({
  controllers: [ExportController],
  providers: [
    ExportService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class ExportModule {}
