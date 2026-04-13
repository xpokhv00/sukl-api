import { Request, Response } from "express";
import { getSupplyRiskStatistics } from "../services/statistics.service";

export async function getSupplyRiskHandler(req: Request, res: Response) {
  const limit = Math.min(
    req.query.limit ? parseInt(req.query.limit as string) : 20,
    100
  );

  const results = await getSupplyRiskStatistics(limit);
  res.json({
    data: results,
    meta: {
      limit,
      total: results.length,
    },
  });
}
