import { Request, Response } from "express";
import { getSubstances, getSubstanceById, getSubstanceMedications } from "../services/substances.service";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";
import { substancesQuerySchema } from "../schemas/substances";

type SubstancesQuery = z.infer<typeof substancesQuerySchema>;

export async function listSubstances(req: Request, res: Response) {
    const result = await getSubstances(req.parsed_query as SubstancesQuery);
    res.json(result);
}

export async function getSubstance(req: Request, res: Response) {
    const substance = await getSubstanceById(req.params.id as string);
    if (!substance) throw new AppError(404, "Substance not found");
    res.json(substance);
}

export async function getSubstanceMedicationsController(req: Request, res: Response) {
    const id = req.params.id as string;
    const query = req.parsed_query as SubstancesQuery;
    const page = parseInt(String(query?.page)) || 1;
    const limit = parseInt(String(query?.limit)) || 20;

    const result = await getSubstanceMedications(id, page, limit);
    if (!result) throw new AppError(404, "Substance not found");
    res.json(result);
}
