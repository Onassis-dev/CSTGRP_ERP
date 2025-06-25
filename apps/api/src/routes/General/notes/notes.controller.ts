import {
  Controller,
  Get,
  Body,
  UseGuards,
  Post,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { createNoteSchema, editNoteSchema } from './notes.schema';
import { NotesService } from './notes.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { z } from 'zod/v4';
import { idObjectSchema } from 'src/utils/schemas';

@ApiTags('Notes')
@Controller('notes')
@UseGuards(new AuthGuard('directory'))
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getNotes() {
    return this.notesService.getNotes();
  }

  @Post()
  createNote(
    @Body(new ZodPiPe(createNoteSchema)) body: z.infer<typeof createNoteSchema>,
  ) {
    return this.notesService.createNote(body);
  }

  @Put()
  editNote(
    @Body(new ZodPiPe(editNoteSchema)) body: z.infer<typeof editNoteSchema>,
  ) {
    return this.notesService.editNote(body);
  }

  @Delete(':id')
  deleteNote(@Param(new ZodPiPe(idObjectSchema)) params) {
    return this.notesService.deleteNote(params);
  }
}
