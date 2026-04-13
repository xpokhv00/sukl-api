import { Request, Response } from "express";
import { getIntermediaries, getIntermediaryByIc } from "../services/intermediaries.service";
import { AppError } from "../middleware/errorHandler";

export async function listIntermediaries(req: Request, res: Response) {
    const result = await getIntermediaries((req as any).parsed_query);
    res.json(result);
}

export async function getIntermediary(req: Request, res: Response) {
    const intermediary = await getIntermediaryByIc(req.params.ic as string);
    if (!intermediary) throw new AppError(404, "Intermediary not found");
    res.json(intermediary);
}
