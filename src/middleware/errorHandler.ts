import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: { message: err.message } });
        return;
    }
    if (err?.statusCode === 400 && err?.details) {
        res.status(400).json({ error: { message: err.message, details: err.details } });
        return;
    }
    process.stderr.write("Unhandled error: " + String(err) + "\n");
    res.status(500).json({ error: { message: "Internal server error" } });
}
