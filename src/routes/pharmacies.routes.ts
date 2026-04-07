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
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: postalCode
 *         schema: { type: string }
 *       - in: query
 *         name: isMailOrder
 *         schema: { type: boolean }
 *       - in: query
 *         name: isDuty
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of pharmacies with opening hours
 *       400:
 *         description: Invalid query parameters
 */
router.get("/", validate(pharmaciesQuerySchema), listPharmacies);

/**
 * @swagger
 * /pharmacies/{id}:
 *   get:
 *     summary: Get a pharmacy by ID
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pharmacy detail with opening hours
 *       404:
 *         description: Pharmacy not found
 */
router.get("/:id", getPharmacy);

export default router;
