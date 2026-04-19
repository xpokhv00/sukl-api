import { Request, Response } from "express";
import { getMedications, getMedicationByCode } from "../services/medications.service";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";
import { medicationsQuerySchema, medicationParamsSchema } from "../schemas/medications";

type MedicationsQuery = z.infer<typeof medicationsQuerySchema>;
type MedicationParams = z.infer<typeof medicationParamsSchema>;

export async function listMedications(req: Request, res: Response) {
    const result = await getMedications(req.parsed_query as MedicationsQuery);
    res.json(result);
}

export async function getMedication(req: Request, res: Response) {
    const { suklCode } = (req.parsed_params as MedicationParams | undefined) ?? (req.params as MedicationParams);
    const medication = await getMedicationByCode(suklCode);
    if (!medication) throw new AppError(404, "Medication not found");
    res.json(medication);
}
