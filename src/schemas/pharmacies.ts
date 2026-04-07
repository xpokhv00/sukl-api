import { z } from "zod";
import { paginationSchema } from "./pagination";

export const pharmaciesQuerySchema = paginationSchema.extend({
    name:        z.string().min(1).optional(),
    city:        z.string().min(1).optional(),
    postalCode:  z.string().min(1).optional(),
    isMailOrder: z.enum(["true", "false"]).transform(v => v === "true").optional(),
    isDuty:      z.enum(["true", "false"]).transform(v => v === "true").optional(),
});
