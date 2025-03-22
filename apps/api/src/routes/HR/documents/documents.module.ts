import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'hr',
    },
  ],
})
export class DocumentsModule {}
