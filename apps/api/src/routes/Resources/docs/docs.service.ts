import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getDocSchema,
} from './docs.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class DocsService {
  async findAllDocs() {
    return await sql`Select * from docs order by page`;
  }

  async createDoc(body: z.infer<typeof createSchema>) {
    await sql`insert into docs ${sql(body)}`;
  }

  async editDoc(body: z.infer<typeof editSchema>) {
    await sql`update docs set ${sql(body)} where id = ${body.id}`;
  }

  async deleteDoc(body: z.infer<typeof deleteSchema>) {
    await sql`delete from docs where id = ${body.id}`;
  }

  async getDoc(body: z.infer<typeof getDocSchema>) {
    const docUrl = (
      await sql`Select doc from docs where page = ${body.page}`
    )[0]?.doc;

    const docId = docUrl.split('-').pop();

    const response = await fetch(
      'https://outline.onassis.dev/api/documents.export',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OUTLINE_API_KEY}`,
        },
        body: JSON.stringify({
          id: docId,
        }),
      },
    );

    let { data }: { data: string } = await response.json();

    const regex = /!\[\]\(/g;
    const indexes = [...data.matchAll(regex)].map((match) => match.index);
    const images = [];

    for (const index of indexes) {
      const imageUrl = data.slice(index + 4, index + 69);
      const attachmentUrl = `https://outline.onassis.dev` + imageUrl;
      try {
        const attachmentResponse = await fetch(attachmentUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OUTLINE_API_KEY}`,
          },
        });
        images.push({
          newUrl: attachmentResponse.url,
          oldUrl: imageUrl,
        });
      } catch {}
    }

    for (const image of images) data = data.replace(image.oldUrl, image.newUrl);

    return data;
  }
}
