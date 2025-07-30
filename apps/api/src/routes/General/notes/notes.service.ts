import { Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';
import { editNoteSchema } from './notes.schema';

@Injectable()
export class NotesService {
  constructor(private readonly req: ContextProvider) {}

  async getNotes() {
    const [user] =
      await sql`select note from users where id = ${this.req.userId}`;
    return user?.note;
  }

  async editNote(body: z.infer<typeof editNoteSchema>) {
    await sql`update users set note = ${body.text} where id = ${this.req.userId}`;
    return this.getNotes();
  }
}
