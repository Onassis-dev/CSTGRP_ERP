import { HttpException, Injectable } from '@nestjs/common';
import {
  createDocSchema,
  editDocSchema,
  getDocumentsSchema,
  idSchema,
} from './documents.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import { deleteFile, saveFile } from 'src/utils/storage';
import { File } from '@nest-lab/fastify-multer';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class DocumentsService {
  constructor(private readonly req: ContextProvider) {}

  async getDocuments(body: z.infer<typeof getDocumentsSchema>) {
    return await sql`select * from documents where "employeeId" = ${body.employeeId}`;
  }

  async uploadDocument(body: z.infer<typeof createDocSchema>, file: File) {
    const [exists] =
      await sql`select 1 from documents where name = ${body.name} and "employeeId" = ${body.employeeId}`;
    if (exists)
      throw new HttpException('Ya se tiene un documento con ese nombre', 400);
    if (!file) throw new HttpException('Falta el archivo', 400);

    const url = await saveFile(file, 'employees');

    await sql.begin(async (sql) => {
      await sql`insert into documents (url, name, "employeeId") values (${url}, ${body.name}, ${body.employeeId}) `;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${body.employeeId}`;

      await this.req.record(
        `Subió un documento (${body.name}) de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName}`,
        sql,
      );
    });
  }
  async editDocument(body: z.infer<typeof editDocSchema>, file: File) {
    const [exists] =
      await sql`select id from documents where name = ${body.name} and "employeeId" = (select "employeeId" from documents where id = ${body.id}) and id <> ${body.id}`;
    if (exists)
      throw new HttpException('Ya se tiene un documento con ese nombre', 400);

    const [prevDoc] = await sql`select * from documents where id = ${body.id}`;

    const url = await saveFile(file, 'employees', prevDoc.url);

    await sql.begin(async (sql) => {
      await sql`update documents set ${sql({ ...body, url, created_at: new Date() })} where id = ${body.id}`;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${prevDoc.employeeId}`;

      await this.req.record(
        `Editó un documento (${prevDoc.name}) de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName}`,
        sql,
      );
    });
  }

  async deleteDocument(body: z.infer<typeof idSchema>) {
    const [document] = await sql`select * from documents where id = ${body.id}`;
    await deleteFile(document.url);

    await sql.begin(async (sql) => {
      await sql`delete from documents where id = ${body.id}`;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${document.employeeId}`;

      await this.req.record(
        `Eliminó un documento (${document.name}) de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName}`,
        sql,
      );
    });
  }
}
