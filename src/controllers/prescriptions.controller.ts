import { Request, Response } from "express";
import { getPrescriptions, getPrescriptionsTotal, getTopPrescriptions } from "../services/prescriptions.service";

export async function listPrescriptions(req: Request, res: Response) {
    const params = (req as any).parsed_query ?? {};
    // suklCode may be injected by the nested /medications/:suklCode/prescriptions route
    if (req.params.suklCode) params.suklCode = req.params.suklCode;
    const result = await getPrescriptions(params);
    res.json(result);
}

export async function getTotalPrescriptions(req: Request, res: Response) {
    const params = (req as any).parsed_query ?? {};
    const result = await getPrescriptionsTotal(params);
    res.json(result);
}

export async function getTopPrescriptionsHandler(req: Request, res: Response) {
    const result = await getTopPrescriptions((req as any).parsed_query);
    res.json(result);
}
