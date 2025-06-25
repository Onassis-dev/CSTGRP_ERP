import { Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';
import { createNoteSchema, editNoteSchema } from './notes.schema';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class NotesService {
  constructor(private readonly req: ContextProvider) {}

  async getNotes() {
    const notes =
      await sql`select id, title, content from notes where "userId" = ${this.req.userId}`;
    return notes;
  }

  async createNote(body: z.infer<typeof createNoteSchema>) {
    await sql`insert into notes (title, content, "userId") values (${body.title}, ${body.content}, ${this.req.userId})`;
    return this.getNotes();
  }

  async editNote(body: z.infer<typeof editNoteSchema>) {
    await sql`update notes set title = ${body.title}, content = ${body.content} where id = ${body.id} and "userId" = ${this.req.userId}`;
    return this.getNotes();
  }

  async deleteNote(body: z.infer<typeof idObjectSchema>) {
    await sql`delete from notes where id = ${body.id} and "userId" = ${this.req.userId}`;
    return this.getNotes();
  }
}
