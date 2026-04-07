import { Router } from "express";
import { listPharmacies, getPharmacy } from "../controllers/pharmacies.controller";
import { validate } from "../middleware/validate";
import { pharmaciesQuerySchema } from "../schemas/pharmacies";

const router = Router();

/**
 * @swagger
 * /pharmacies:
 *   get:
 *     summary: List pharmacies
 *     description: Returns Czech pharmacies with their opening hours. Filter by location, mail-order capability, or duty status.
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive pharmacy name search
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Filter by city (case-insensitive)
 *       - in: query
 *         name: postalCode
 *         schema: { type: string }
 *         description: Filter by postal code prefix
 *       - in: query
 *         name: isMailOrder
 *         schema: { type: boolean }
 *         description: "`true` to show only mail-order pharmacies"
 *       - in: query
 *         name: isDuty
 *         schema: { type: boolean }
 *         description: "`true` to show only duty pharmacies"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of pharmacies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Pharmacy' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(pharmaciesQuerySchema), listPharmacies);

/**
 * @swagger
 * /pharmacies/{id}:
 *   get:
 *     summary: Get a pharmacy by ID
 *     description: Returns full pharmacy detail including weekly opening hours.
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Pharmacy workplace code (e.g. `00200379227`)
 *     responses:
 *       200:
 *         description: Pharmacy detail with opening hours
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pharmacy' }
 *       404:
 *         description: Pharmacy not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", getPharmacy);

export default router;
