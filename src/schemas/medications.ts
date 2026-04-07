import { z } from "zod";
import { paginationSchema } from "./pagination";

export const medicationsQuerySchema = paginationSchema.extend({
    name:       z.string().min(1).optional(),
    atc:        z.string().min(1).optional(),
    substance:  z.string().min(1).optional(),
    form:       z.string().min(1).optional(),
    dispensing: z.string().min(1).optional(),
});

export const medicationParamsSchema = z.object({
    suklCode: z.string().regex(/^\d{7}$/, "suklCode must be a 7-digit number"),
});
