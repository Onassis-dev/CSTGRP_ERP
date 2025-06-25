import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './devices.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class DevicesService {
  async findAllDevices() {
    const devices =
      await sql`Select * from devices order by wifipw asc, name desc, id desc `;
    return devices;
  }

  async createDevice(body: z.infer<typeof createSchema>) {
    await sql`insert into devices ${sql(body)}`;
    return;
  }

  async editDevice(body: z.infer<typeof editSchema>) {
    await sql`update devices set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteDevice(body: z.infer<typeof deleteSchema>) {
    await sql`delete from devices where id = ${body.id}`;

    return;
  }
}
