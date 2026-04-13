import { Router } from "express";
import { listPrescriptions, getTotalPrescriptions, getTopPrescriptionsHandler } from "../controllers/prescriptions.controller";
import { validate } from "../middleware/validate";
import { prescriptionsQuerySchema, prescriptionsTotalQuerySchema, prescriptionsTopQuerySchema } from "../schemas/prescriptions";

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
 *         name: atcCode
 *         schema: { type: string }
 *         description: Filter by ATC code prefix (e.g. `A10` for diabetes drugs)
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
 *         description: Paginated prescription statistics with full medication details
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
 *                       id: { type: string, description: ID }
 *                       districtCode: { type: string, example: '3100' }
 *                       districtName: { type: string, example: 'Praha 4' }
 *                       year: { type: integer, example: 2026 }
 *                       month: { type: integer, minimum: 1, maximum: 12, example: 2 }
 *                       quantity: { type: integer, example: 7907 }
 *                       medication:
 *                         allOf:
 *                           - $ref: '#/components/schemas/MedicationSummary'
 *                           - type: object
 *                             properties:
 *                               form:
 *                                 type: object
 *                                 properties:
 *                                   code: { type: string }
 *                                   name: { type: string }
 *                               route:
 *                                 type: object
 *                                 properties:
 *                                   code: { type: string }
 *                                   name: { type: string }
 *                               atc:
 *                                 type: object
 *                                 properties:
 *                                   code: { type: string }
 *                                   name: { type: string }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(prescriptionsQuerySchema), listPrescriptions);

/**
 * @swagger
 * /prescriptions/top:
 *   get:
 *     summary: Get top prescribed medications
 *     description: Returns the most frequently prescribed medications (nationally or by district). Without districtCode, returns national totals.
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: query
 *         name: districtCode
 *         schema: { type: string }
 *         description: Filter by district code (e.g. `3100` for Praha 4). If omitted, returns national data.
 *       - in: query
 *         name: atcCode
 *         schema: { type: string }
 *         description: Filter by ATC code prefix (e.g. `A10` for diabetes drugs)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Top medications with prescription quantities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/MedicationSummary'
 *                       - type: object
 *                         properties:
 *                           totalQuantity: { type: integer, description: "Total prescriptions across period" }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/top", validate(prescriptionsTopQuerySchema), getTopPrescriptionsHandler);

/**
 * @swagger
 * /prescriptions/total:
 *   get:
 *     summary: Get total prescription quantity
 *     description: Returns the sum of all prescription quantities across all districts matching the filters.
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: query
 *         name: suklCode
 *         schema: { type: string, pattern: '^\d{7}$' }
 *         description: Filter by SUKL code
 *       - in: query
 *         name: atcCode
 *         schema: { type: string }
 *         description: Filter by ATC code prefix (e.g. `A10` for diabetes drugs)
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2026 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *     responses:
 *       200:
 *         description: Total prescription quantity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   description: Sum of all quantities across all districts
 *                 filters:
 *                   type: object
 *                   description: Applied filters
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/total", validate(prescriptionsTotalQuerySchema), getTotalPrescriptions);

export default router;
