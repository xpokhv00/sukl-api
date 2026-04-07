import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, source: "query" | "params" = "query") {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            next({
                statusCode: 400,
                message: "Invalid request parameters",
                details: (result.error as ZodError).issues.map(i => ({
                    field: i.path.join("."),
                    message: i.message,
                })),
            });
            return;
        }
        // Attach parsed/coerced values so controllers get typed data
        (req as any)[`parsed_${source}`] = result.data;
        next();
    };
}
