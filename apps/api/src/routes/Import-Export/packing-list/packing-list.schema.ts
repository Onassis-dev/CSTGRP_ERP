import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const editPackingListSchema = z.object({
  id: idSchema,
  packSlip: z.string(),
  shipVia: idSchema,
  consignee: idSchema,
  shipDate: z.string(),
  blNo: z.string(),
  trk: z.string(),
  po: z.string(),
  invoice: z.string(),
  weight: z.string(),
  destination: idSchema,
  carrierExp: idSchema,
  shipTo: idSchema,
});

export const downloadPackingListSchema = z.object({
  id: idSchema,
});
