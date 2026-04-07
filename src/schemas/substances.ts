import { z } from "zod";
import { paginationSchema } from "./pagination";

export const substancesQuerySchema = paginationSchema.extend({
    name: z.string().min(1).optional(),
});
