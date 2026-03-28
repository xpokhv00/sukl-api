import { Request, Response } from "express";
import { getMedications } from "../services/medications.service";

export async function listMedications(req: Request, res: Response) {
    try {
        const result = await getMedications({
            name: req.query.name as string,
            atc: req.query.atc as string,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 20,
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: {
                message: "Failed to fetch medications",
            },
        });
    }
}
