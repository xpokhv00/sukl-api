import { z } from "zod";
import { paginationSchema } from "./pagination";

export const organizationsQuerySchema = paginationSchema.extend({
    name: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
});

export const organizationParamsSchema = z.object({
    code: z.string().min(1),
});

export const organizationMedicationsQuerySchema = paginationSchema;

export const organizationDisruptionsQuerySchema = paginationSchema;
