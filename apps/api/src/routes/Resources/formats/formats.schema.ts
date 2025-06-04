import { z } from 'zod';

export const folderSchema = z.object({
  folder: z.string(),
});

export const nameSchema = z.object({
  name: z.string(),
});

export const editFolderSchema = z.object({
  oldName: z.string(),
  name: z.string(),
});

export const createFormatSchema = z.object({
  name: z.string(),
  folder: z.string(),
  file: z.any(),
});

export const editFormatSchema = z.object({
  oldName: z.string(),
  name: z.string(),
  folder: z.string(),
  file: z.any(),
});

export const formatNameSchema = z.object({
  name: z.string(),
  folder: z.string(),
});
