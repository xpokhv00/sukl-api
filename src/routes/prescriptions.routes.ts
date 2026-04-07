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
 *     description: District-level prescription quantity data from the eRecept system (Feb 2026). At least one filter is recommended to narrow results.
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: query
 *         name: suklCode
 *         schema: { type: string, pattern: '^\d{7}$' }
 *         description: Filter by SUKL code
 *       - in: query
 *         name: districtCode
 *         schema: { type: string }
 *         description: Filter by district code (e.g. `3100` for Praha 4)
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2026 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated prescription statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Prescription' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(prescriptionsQuerySchema), listPrescriptions);

export default router;
