import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, registerSchema } from './users.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import bcrypt from 'bcrypt';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class UsersService {
  constructor(private readonly req: ContextProvider) {}

  async findAllUsers() {
    const users = await sql`SELECT * FROM users ORDER BY username ASC`;
    const filteredUsers = users.map((obj) => ({ ...obj, password: '' }));
    return filteredUsers;
  }

  async registerUser(body: z.infer<typeof registerSchema>) {
    const hash = await bcrypt.hash(body.password, 10);

    await sql.begin(async (sql) => {
      await sql`insert into users ${sql({ ...body, password: hash })}`;
      await this.req.record(`Creo el usuario ${body.username}`, sql);
    });
    return;
  }

  async editUser(body: z.infer<typeof editSchema>) {
    if (body.password) body.password = await bcrypt.hash(body.password, 10);

    const [previousObj] =
      await sql`select username from users where id = ${body.id}`;

    await sql.begin(async (sql) => {
      await sql`update users set ${sql(body)} where id = ${body.id}`;
      await this.req.record(
        `Actualizo el usuario ${previousObj.username}`,
        sql,
      );
    });
    return;
  }

  async deleteUser(body: z.infer<typeof deleteSchema>) {
    await sql.begin(async (sql) => {
      const [deletedUser] =
        await sql`delete from users where id = ${body.id} returning username`;
      await this.req.record(`Elimino el usuario ${deletedUser.username}`, sql);
    });

    return;
  }
}
