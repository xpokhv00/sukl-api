import { z } from "zod";
import { paginationSchema } from "./pagination";

export const disruptionsQuerySchema = paginationSchema.extend({
  atc:     z.string().min(1).optional(),
  suklCode: z.string().min(1).optional(),
  type:    z.enum(["START", "INTERRUPTION", "ENDED", "RESUMED"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo:   z.string().datetime().optional(),
});

export const disruptionsActiveQuerySchema = paginationSchema.extend({
  atc:     z.string().min(1).optional(),
  suklCode: z.string().min(1).optional(),
  type:    z.enum(["START", "INTERRUPTION", "ENDED", "RESUMED"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo:   z.string().datetime().optional(),
});
