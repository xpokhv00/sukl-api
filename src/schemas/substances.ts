import { z } from "zod";
import { paginationSchema } from "./pagination";

export const substancesQuerySchema = paginationSchema.extend({
    name: z.string().min(1).optional(),
    searchSynonyms: z.enum(["true", "false"]).optional().transform(val => val !== "false"), // Default to true
});
