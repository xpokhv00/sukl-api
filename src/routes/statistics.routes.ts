import { Router } from "express";
import { getSupplyRiskHandler } from "../controllers/statistics.controller";
import { validate } from "../middleware/validate";
import { supplyRiskQuerySchema } from "../schemas/statistics";

const router = Router();

/**
 * @swagger
 * /statistics/supply-risk:
 *   get:
 *     summary: Get supply risk dashboard
 *     description: Returns ATC groups with active supply disruptions. Higher risk score indicates more disruptions relative to prescription volume.
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *         description: Maximum number of ATC groups to return
 *     responses:
 *       200:
 *         description: Supply risk statistics by ATC group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       atcCode:
 *                         type: string
 *                         description: ATC code (e.g. A10BA)
 *                       atcName:
 *                         type: string
 *                         description: ATC group name
 *                       activeDisruptions:
 *                         type: integer
 *                         description: Number of active supply disruptions
 *                       totalPrescriptions:
 *                         type: integer
 *                         description: Total prescription volume for this ATC group
 *                       disruptionRatio:
 *                         type: number
 *                         description: Ratio of disrupted medications to total medications in the ATC group
 *                       riskScore:
 *                         type: number
 *                         description: Risk score (disruptions weighted by prescription volume)
 *                 meta:
 *                   type: object
 *                   properties:
 *                     limit: { type: integer }
 *                     total: { type: integer }
 */
router.get("/supply-risk", validate(supplyRiskQuerySchema), getSupplyRiskHandler);

export default router;
