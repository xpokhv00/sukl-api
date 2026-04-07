import { Request, Response } from "express";
import { getSubstances, getSubstanceById } from "../services/substances.service";
import { AppError } from "../middleware/errorHandler";

export async function listSubstances(req: Request, res: Response) {
    const result = await getSubstances((req as any).parsed_query);
    res.json(result);
}

export async function getSubstance(req: Request, res: Response) {
    const substance = await getSubstanceById(req.params.id);
    if (!substance) throw new AppError(404, "Substance not found");
    res.json(substance);
}
