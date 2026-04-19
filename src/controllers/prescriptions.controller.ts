import { Request, Response } from "express";
import { getPrescriptions, getPrescriptionsTotal, getTopPrescriptions } from "../services/prescriptions.service";
import { z } from "zod";
import {
    prescriptionsQuerySchema,
    prescriptionsTotalQuerySchema,
    prescriptionsTopQuerySchema,
} from "../schemas/prescriptions";

type PrescriptionsQuery = z.infer<typeof prescriptionsQuerySchema>;
type PrescriptionsTotalQuery = z.infer<typeof prescriptionsTotalQuerySchema>;
type PrescriptionsTopQuery = z.infer<typeof prescriptionsTopQuerySchema>;

export async function listPrescriptions(req: Request, res: Response) {
    const params = (req.parsed_query ?? {}) as PrescriptionsQuery;
    // suklCode may be injected by the nested /medications/:suklCode/prescriptions route
    if (req.params.suklCode) params.suklCode = req.params.suklCode as string;
    const result = await getPrescriptions(params);
    res.json(result);
}

export async function getTotalPrescriptions(req: Request, res: Response) {
    const result = await getPrescriptionsTotal((req.parsed_query ?? {}) as PrescriptionsTotalQuery);
    res.json(result);
}

export async function getTopPrescriptionsHandler(req: Request, res: Response) {
    const result = await getTopPrescriptions(req.parsed_query as PrescriptionsTopQuery);
    res.json(result);
}
