import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import { ContextProvider } from 'src/interceptors/context.provider';
import {
  editPassSchema,
  getJobsSchema,
  getPassesSchema,
} from './exitPass.schema';
import sql from 'src/utils/db';
import { idObjectSchema } from 'src/utils/schemas';
import { fillExitPass } from './exitPass.generate';

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
          await sql`insert into "exitPass" ("date", "contractorId", "folio") values
          (${body.date}, ${body.contractorId}, (select COALESCE(max(folio), 0) from "exitPass") + 1) returning id`;

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

  async getJobs(body: z.infer<typeof getJobsSchema>) {
    if (!body.contractorId) return [];

    const jobs = await sql`
    SELECT * FROM (
      select jobs.id, jobs.ref, COALESCE(materials.code, jobs.part) as code, jobs.amount
      from jobs
      left join materialmovements on jobs."movementId" = materialmovements.id
      left join materials on materialmovements."materialId" = materials.id
      where "exitId" is null
      order by due desc, ref desc
      limit 500
    ) 
      WHERE code is not null
      AND code in (select part from contractor_prices where "contractorId" = ${body.contractorId})
    `;

    return jobs;
  }

  async getJobsForExitPass(exitId: number) {
    return sql`
      select jobs.id, jobs.ref, COALESCE(materials.code, jobs.part) as code, jobs.amount, jobs."contractorAmount"
      from jobs
      left join materialmovements on jobs."movementId" = materialmovements.id
      left join materials on materialmovements."materialId" = materials.id
      where "exitId" = ${exitId}
      order by due desc, ref desc
`;
  }

  async download(body: z.infer<typeof idObjectSchema>) {
    const [data] =
      await sql`select *, (select name from contractors where id = "contractorId") as contractor from "exitPass" where id = ${body.id}`;

    data.jobs =
      await sql`select jobs.ref, jobs.description, jobs."contractorAmount"
    from jobs
    where "exitId" = ${body.id}
    order by due desc, ref desc`;

    console.log(data);

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'exitPass.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const [page] = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    fillExitPass(page, font, data);

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  }
}
