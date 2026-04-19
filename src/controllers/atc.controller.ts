import { Request, Response } from "express";
import { getAtcNodes, getAtcNode } from "../services/atc.service";
import { AppError } from "../middleware/errorHandler";

export async function listAtcNodes(req: Request, res: Response) {
    const parent = req.query.parent as string | undefined;
    const data = await getAtcNodes(parent);
    res.json({ data });
}

export async function getAtc(req: Request, res: Response) {

    // ATC codes are stored uppercase in DB; normalize to avoid case-sensitive mismatches.
    const node = await getAtcNode((req.params.code as string).toUpperCase());
    if (!node) throw new AppError(404, "ATC code not found");
    res.json(node);
}
