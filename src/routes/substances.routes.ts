import { Router } from "express";
import { listSubstances, getSubstance } from "../controllers/substances.controller";
import { validate } from "../middleware/validate";
import { substancesQuerySchema } from "../schemas/substances";

const router = Router();

/**
 * @swagger
 * /substances:
 *   get:
 *     summary: List active substances
 *     tags: [Substances]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by substance name or INN name
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of substances
 *       400:
 *         description: Invalid query parameters
 */
router.get("/", validate(substancesQuerySchema), listSubstances);

/**
 * @swagger
 * /substances/{id}:
 *   get:
 *     summary: Get a substance with synonyms and medications that contain it
 *     tags: [Substances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Substance detail
 *       404:
 *         description: Substance not found
 */
router.get("/:id", getSubstance);

export default router;
