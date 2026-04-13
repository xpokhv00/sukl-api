import { z } from "zod";
import { paginationSchema } from "./pagination";

export const prescriptionsQuerySchema = paginationSchema.extend({
    suklCode:     z.string().regex(/^\d{7}$/, "suklCode must be a 7-digit number").optional(),
    districtCode: z.string().min(1).optional(),
    atcCode:      z.string().min(1).optional(),
    year:         z.coerce.number().int().min(2000).max(2100).optional(),
    month:        z.coerce.number().int().min(1).max(12).optional(),
});

export const prescriptionsTotalQuerySchema = z.object({
    suklCode: z.string().regex(/^\d{7}$/, "suklCode must be a 7-digit number").optional(),
    atcCode:  z.string().min(1).optional(),
    year:     z.coerce.number().int().min(2000).max(2100).optional(),
    month:    z.coerce.number().int().min(1).max(12).optional(),
});

export const prescriptionsTopQuerySchema = paginationSchema.extend({
    districtCode: z.string().min(1).optional(),
    atcCode:      z.string().min(1).optional(),
});
