import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './categories.schema';
import { z } from 'zod';
import sql from 'src/utils/db';

@Injectable()
export class CategoriesService {
  async findAllCategories() {
    const categories =
      await sql`Select * from purchasecategories order by name asc`;
    return categories;
  }

  async createCategory(body: z.infer<typeof createSchema>) {
    await sql`insert into purchasecategories ${sql(body)}`;
    return;
  }

  async editCategory(body: z.infer<typeof editSchema>) {
    await sql`update purchasecategories set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteCategory(body: z.infer<typeof deleteSchema>) {
    await sql`delete from purchasecategories where id = ${body.id}`;

    return;
  }
}
