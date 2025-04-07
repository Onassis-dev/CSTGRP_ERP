import postgres from 'postgres';
import sql from './db';

export type module = 'inventory' | 'users' | 'hr' | 'production';
export type action = 'create' | 'delete' | 'update';

export async function createRecord(
  text: string,
  action: action,
  user?: string,
  module?: module,
  dbInstance?: postgres.Sql,
) {
  if (!dbInstance) dbInstance = sql;

  if (user) {
    await dbInstance`insert into records (text, action, module, "user") values
    (${text}, ${action}, ${module}, (select username from users where id = ${user}))`;
  } else {
    await dbInstance`insert into records (text, action, module, "user") values
      (${text}, ${action}, ${module}, 'Anonimo')`;
  }
}
