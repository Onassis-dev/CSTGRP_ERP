import { Injectable, HttpException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join } from 'path';
import {
  createFormatSchema,
  editFolderSchema,
  editFormatSchema,
  folderSchema,
  formatNameSchema,
  nameSchema,
} from './formats.schema';
import { z } from 'zod';
import { File } from '@nest-lab/fastify-multer';

const targetPath = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'storage',
  'formats',
);

@Injectable()
export class FormatsService {
  async download(params: z.infer<typeof formatNameSchema>) {
    const formatPath = join(targetPath, params.folder, params.name);
    return fs.readFile(formatPath);
  }

  async getFormats(params: z.infer<typeof folderSchema>) {
    const folderPath = join(targetPath, params.folder);
    const dirents = await fs.readdir(folderPath, { withFileTypes: true });
    return dirents
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name);
  }

  async createFormat(params: z.infer<typeof createFormatSchema>, file: File) {
    const formatPath = join(targetPath, params.folder, params.name);

    try {
      await fs.access(formatPath);
      throw new HttpException('El nombre del archivo ya esta ocupado', 409);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      await fs.writeFile(formatPath, file.buffer);
    }
  }

  async editFormat(params: z.infer<typeof editFormatSchema>, file: File) {
    const oldFormatPath = join(targetPath, params.folder, params.oldName);
    const newFormatPath = join(targetPath, params.folder, params.name);

    if (params.oldName !== params.name) {
      try {
        await fs.access(newFormatPath);
        throw new HttpException('El nombre del archivo ya esta ocupado', 409);
      } catch (error) {
        if (error instanceof HttpException) throw error;
        await fs.rename(oldFormatPath, newFormatPath);
      }
    }

    if (file.buffer) await fs.writeFile(newFormatPath, file.buffer);
  }

  async deleteFormat(params: z.infer<typeof formatNameSchema>) {
    const formatPath = join(targetPath, params.folder, params.name);
    await fs.rm(formatPath);
  }

  // Folders
  async getFolders() {
    const dirents = await fs.readdir(targetPath, { withFileTypes: true });
    return dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  }

  async createFolder(body: z.infer<typeof nameSchema>) {
    const folderPath = join(targetPath, body.name);
    try {
      await fs.access(folderPath);
      throw new HttpException('La carpeta ya existe', 409);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      await fs.mkdir(folderPath);
    }
  }

  async editFolder(body: z.infer<typeof editFolderSchema>) {
    const oldFolderPath = join(targetPath, body.oldName);
    const newFolderPath = join(targetPath, body.name);

    try {
      await fs.access(oldFolderPath);
    } catch (error) {
      throw new HttpException('La carpeta no existe', 404);
    }

    if (body.oldName !== body.name) {
      try {
        await fs.access(newFolderPath);
        throw new HttpException('Ya existe una carpeta con ese nombre', 409);
      } catch (error) {
        if (error instanceof HttpException) throw error;
        await fs.rename(oldFolderPath, newFolderPath);
      }
    }
  }

  async deleteFolder(body: z.infer<typeof nameSchema>) {
    const folderPath = join(targetPath, body.name);

    try {
      await fs.rmdir(folderPath);
    } catch (err) {
      if (err.code === 'ENOTEMPTY')
        throw new HttpException('La carpeta no esta vacia', 409);
      throw err;
    }
  }
}
