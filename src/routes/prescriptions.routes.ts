import { Router } from "express";
import { listPrescriptions } from "../controllers/prescriptions.controller";
import { validate } from "../middleware/validate";
import { prescriptionsQuerySchema } from "../schemas/prescriptions";

const router = Router();

/**
 * @swagger
 * /prescriptions:
 *   get:
 *     summary: Query prescription statistics
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: query
 *         name: suklCode
 *         schema: { type: string, pattern: '^\d{7}$' }
 *       - in: query
 *         name: districtCode
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated prescription statistics
 *       400:
 *         description: Invalid query parameters
 */
router.get("/", validate(prescriptionsQuerySchema), listPrescriptions);

export default router;
