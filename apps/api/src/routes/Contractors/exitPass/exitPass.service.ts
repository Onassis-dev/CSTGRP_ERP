import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import { ContextProvider } from 'src/interceptors/context.provider';
import { editPassSchema, getPassesSchema } from './exitPass.schema';
import sql from 'src/utils/db';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class ExitPassService {
  constructor(private readonly req: ContextProvider) {}

  async getAll(body: z.infer<typeof getPassesSchema>) {
    const passes = await sql`select * from "exitPass"
    WHERE 
    ${body.contractorId ? sql`"contractorId" = ${body.contractorId}` : sql`TRUE`} AND
    ${body.date ? sql`"date" = ${body.date}` : sql`TRUE`}
    ORDER BY "date" DESC
    `;

    return passes;
  }

  async createOrEdit(
    body: z.infer<typeof editPassSchema>,
    edit: boolean = false,
  ) {
    const jobsRows = await sql`
    select jobs.id, jobs.ref, COALESCE(materials.code, jobs.part) as code
    from jobs
    left join materialmovements on jobs."movementId" = materialmovements.id
    left join materials on materialmovements."materialId" = materials.id
    where jobs.id in ${sql(body.jobs.map((job) => job.id))}`;

    const jobs = jobsRows.map((job) => ({
      id: job.id,
      ref: job.ref,
      code: job.code,
      contractorAmount:
        body.jobs.find((j) => j.id === job.id)?.contractorAmount || 0,
      price: 0,
    }));

    for (const job of jobs) {
      const [contractorPrice] = await sql`select * from contractor_prices 
      WHERE "contractorId" = ${body.contractorId} 
      AND part = ${job.code}`;

      if (!contractorPrice) {
        throw new HttpException(`Precio no encontrado: ${job.ref}`, 400);
      }

      job.price = contractorPrice.price;
    }

    if (jobsRows.length !== body.jobs.length) {
      throw new HttpException('Uno o varios jobs no encontrados', 400);
    }
    if (jobs.some((job) => !job.price || job.price <= 0)) {
      throw new HttpException('El precio no puede ser 0', 400);
    }
    if (jobs.some((job) => job.contractorAmount <= 0)) {
      throw new HttpException('La cantidad de producción no puede ser 0', 400);
    }

    await sql.begin(async (sql) => {
      if (edit) {
        const [updatedPass] =
          await sql`update "exitPass" set ${sql({ date: body.date, contractorId: body.contractorId })} where id = ${body.id} returning id`;

        if (!updatedPass) {
          throw new HttpException('Pase no encontrado', 400);
        }

        await sql`update jobs set
          "contractorAmount" = 0,
          "contractorPrice" = null,
          "exitId" = null
          where "exitId" = ${updatedPass.id}`;

        for (const job of jobs) {
          await sql`update jobs set
          "contractorAmount" = ${job.contractorAmount},
          "contractorPrice" = ${job.price},
          "exitId" = ${updatedPass.id}
          where id = ${job.id}`;
        }
      } else {
        const [insertedPass] =
          await sql`insert into "exitPass" ${sql({ date: body.date, contractorId: body.contractorId })} returning id`;

        for (const job of jobs) {
          await sql`update jobs set
          "contractorAmount" = ${job.contractorAmount},
          "contractorPrice" = ${job.price},
          "exitId" = ${insertedPass.id}
          where id = ${job.id}`;
        }
      }
    });
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql.begin(async (sql) => {
      await sql`update jobs set
      "contractorAmount" = 0,
      "contractorPrice" = null,
      "exitId" = null
      where "exitId" = ${body.id}`;

      await sql`delete from "exitPass" where id = ${body.id}`;
    });
    return;
  }
}
