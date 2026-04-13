import { z } from "zod";
import { paginationSchema } from "./pagination";

export const intermediariesQuerySchema = paginationSchema.extend({
    name: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
});

export const intermediaryParamsSchema = z.object({
    ic: z.string().min(1),
});
