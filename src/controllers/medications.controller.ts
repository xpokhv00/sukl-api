import { Request, Response } from "express";
import { getMedications, getMedicationByCode } from "../services/medications.service";
import { AppError } from "../middleware/errorHandler";

export async function listMedications(req: Request, res: Response) {
    const result = await getMedications((req as any).parsed_query);
    res.json(result);
}

export async function getMedication(req: Request, res: Response) {
    const { suklCode } = (req as any).parsed_params ?? req.params;
    const medication = await getMedicationByCode(suklCode);
    if (!medication) throw new AppError(404, "Medication not found");
    res.json(medication);
}
