import { Request, Response } from "express";
import { getMedications, getMedicationByCode } from "../services/medications.service";

export async function listMedications(req: Request, res: Response) {
    try {
        const result = await getMedications({
            name: req.query.name as string | undefined,
            atc: req.query.atc as string | undefined,
            substance: req.query.substance as string | undefined,
            form: req.query.form as string | undefined,
            dispensing: req.query.dispensing as string | undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 20,
        });
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: { message: "Failed to fetch medications" } });
    }
}

export async function getMedication(req: Request, res: Response) {
    try {
        const medication = await getMedicationByCode(req.params.suklCode);
        if (!medication) {
            res.status(404).json({ error: { message: "Medication not found" } });
            return;
        }
        res.json(medication);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: { message: "Failed to fetch medication" } });
    }
}
