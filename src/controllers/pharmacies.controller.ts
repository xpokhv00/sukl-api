import { Request, Response } from "express";
import { getPharmacies, getPharmacyById } from "../services/pharmacies.service";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";
import { pharmaciesQuerySchema } from "../schemas/pharmacies";

type PharmaciesQuery = z.infer<typeof pharmaciesQuerySchema>;

export async function listPharmacies(req: Request, res: Response) {
    const result = await getPharmacies(req.parsed_query as PharmaciesQuery);
    res.json(result);
}

export async function getPharmacy(req: Request, res: Response) {
    const pharmacy = await getPharmacyById(req.params.id as string);
    if (!pharmacy) throw new AppError(404, "Pharmacy not found");
    res.json(pharmacy);
}
