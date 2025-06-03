import { z } from 'zod';

const numberRegex = /^-?(?:\d+|\d*\.\d{1,2})$/;

export const numberSchema = z.coerce.string().regex(numberRegex);
