import { Request, Response } from "express";
import { listDisruptions, listActiveDisruptions, listActiveDisruptionsWithReplacement, getDisruptionsBySuklCode, getReplacementOptions } from "../services/disruptions.service";
import { AppError } from "../middleware/errorHandler";

export async function getDisruptions(req: Request, res: Response) {
  const result = await listDisruptions((req as any).parsed_query);
  res.json(result);
}

export async function getActiveDisruptions(req: Request, res: Response) {
  const result = await listActiveDisruptions((req as any).parsed_query);
  res.json(result);
}

export async function getActiveDisruptionsWithReplacement(req: Request, res: Response) {
  const result = await listActiveDisruptionsWithReplacement((req as any).parsed_query);
  res.json(result);
}

export async function getDisruptionHistory(req: Request, res: Response) {
  const suklCode = req.params.suklCode as string;
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "20");

  const result = await getDisruptionsBySuklCode(suklCode, page, limit);
  res.json(result);
}

export async function getReplacementAlternatives(req: Request, res: Response) {
  const suklCode = req.params.suklCode as string;
  const result = await getReplacementOptions(suklCode);
  res.json(result);
}
