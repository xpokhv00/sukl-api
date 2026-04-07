import { Request, Response, NextFunction } from "express";
import { getRegistrationChanges } from "../services/registrationChanges.service";

export async function listRegistrationChanges(req: Request, res: Response, next: NextFunction) {
    const result = await getRegistrationChanges((req as any).parsed_query);
    res.json(result);
}
