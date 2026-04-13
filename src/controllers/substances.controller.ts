import { Request, Response } from "express";
import { getSubstances, getSubstanceById, getSubstanceMedications } from "../services/substances.service";
import { AppError } from "../middleware/errorHandler";

export async function listSubstances(req: Request, res: Response) {
    const result = await getSubstances((req as any).parsed_query);
    res.json(result);
}

export async function getSubstance(req: Request, res: Response) {
    const substance = await getSubstanceById(req.params.id as string);
    if (!substance) throw new AppError(404, "Substance not found");
    res.json(substance);
}

export async function getSubstanceMedicationsController(req: Request, res: Response) {
    const id = req.params.id as string;
    const page = parseInt((req as any).parsed_query?.page) || 1;
    const limit = parseInt((req as any).parsed_query?.limit) || 20;

    const result = await getSubstanceMedications(id, page, limit);
    if (!result) throw new AppError(404, "Substance not found");
    res.json(result);
}
