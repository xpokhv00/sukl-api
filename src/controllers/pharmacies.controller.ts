import { Request, Response } from "express";
import { getPharmacies, getPharmacyById } from "../services/pharmacies.service";
import { AppError } from "../middleware/errorHandler";

export async function listPharmacies(req: Request, res: Response) {
    const result = await getPharmacies((req as any).parsed_query);
    res.json(result);
}

export async function getPharmacy(req: Request, res: Response) {
    const pharmacy = await getPharmacyById(req.params.id);
    if (!pharmacy) throw new AppError(404, "Pharmacy not found");
    res.json(pharmacy);
}
