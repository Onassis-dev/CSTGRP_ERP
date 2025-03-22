import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [NotesController],
  providers: [
    NotesService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'notes',
    },
  ],
})
export class NotesModule {}
