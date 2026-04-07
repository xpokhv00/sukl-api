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
 *     description: Search substances by name or INN name. Each substance can appear in multiple medications.
 *     tags: [Substances]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive search across name and INN name
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of substances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SubstanceSummary' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(substancesQuerySchema), listSubstances);

/**
 * @swagger
 * /substances/{id}:
 *   get:
 *     summary: Get a substance by ID
 *     description: Returns the substance with all its synonyms and the list of medications it appears in.
 *     tags: [Substances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Substance ID (numeric string, e.g. `12345`)
 *     responses:
 *       200:
 *         description: Substance detail with synonyms and medications
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SubstanceDetail' }
 *       404:
 *         description: Substance not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", getSubstance);

export default router;
