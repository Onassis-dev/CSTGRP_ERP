import { HttpException, Injectable } from '@nestjs/common';
import { File } from '@nest-lab/fastify-multer';
import {
  createEvaluationSchema,
  getEvaluationsSchema,
} from './evaluations.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { saveFile, deleteFile } from 'src/utils/storage';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class EvaluationsService {
  constructor(private readonly req: ContextProvider) {}

  async getEvaluations(body: z.infer<typeof getEvaluationsSchema>) {
    return await sql`select * from evaluations where "employeeId" = ${body.employeeId} order by date desc`;
  }

  async uploadEvaluation(
    body: z.infer<typeof createEvaluationSchema>,
    file: File,
  ) {
    if (!file) throw new HttpException('Falta el archivo', 400);

    const url = await saveFile(file, 'employees');
    await sql.begin(async (sql) => {
      await sql`insert into evaluations (url, score, date, "employeeId") values (${url}, ${body.score}, ${body.date}, ${body.employeeId})`;
      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${body.employeeId}`;
      await this.req.record(
        `Subió una evaluación de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} con calificación ${body.score}`,
        sql,
      );
    });
    return;
  }

  async deleteEvaluation(body: z.infer<typeof idObjectSchema>) {
    const [evaluation] =
      await sql`select url, "employeeId", created_at from evaluations where id = ${body.id}`;
    if (!evaluation) throw new HttpException('Evaluación no encontrada', 404);

    await deleteFile(evaluation.url);
    await sql.begin(async (sql) => {
      await sql`delete from evaluations where id = ${body.id} returning created_at`;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${evaluation.employeeId}`;

      await this.req.record(
        `Eliminó una evaluación de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} creada el ${evaluation.created_at}`,
        sql,
      );
    });
    return;
  }
}
