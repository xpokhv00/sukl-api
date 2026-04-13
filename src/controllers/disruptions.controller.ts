import { Request, Response } from "express";
import { listDisruptions, listActiveDisruptions } from "../services/disruptions.service";

export async function getDisruptions(req: Request, res: Response) {
  const result = await listDisruptions((req as any).parsed_query);
  res.json(result);
}

export async function getActiveDisruptions(req: Request, res: Response) {
  const result = await listActiveDisruptions((req as any).parsed_query);
  res.json(result);
}
