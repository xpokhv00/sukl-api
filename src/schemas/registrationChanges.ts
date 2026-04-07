import { z } from "zod";
import { paginationSchema } from "./pagination";

export const registrationChangesQuerySchema = paginationSchema.extend({
    changeType: z.enum(["NEW", "CANCELLED", "CANCELLED_EU"]).optional(),
    name:       z.string().min(1).optional(),
    holder:     z.string().min(1).optional(),
});
