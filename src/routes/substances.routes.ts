import { Router } from "express";
import { listSubstances, getSubstance, getSubstanceMedicationsController } from "../controllers/substances.controller";
import { validate } from "../middleware/validate";
import { substancesQuerySchema } from "../schemas/substances";

const router = Router();

/**
 * @swagger
 * /substances:
 *   get:
 *     summary: List active substances
 *     description: Search substances by name, INN name, or synonyms. Results are ordered by match quality (exact name match first, then synonym matches, then partial matches). Each substance can appear in multiple medications.
 *     tags: [Substances]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive search across name, INN name, and synonyms (ordered by match quality)
 *       - in: query
 *         name: searchSynonyms
 *         schema: { type: boolean, default: true }
 *         description: Search in substance synonyms (default is true, set to false to search only name and INN)
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
 * /substances/{id}/medications:
 *   get:
 *     summary: Get all medications containing a substance
 *     description: Returns paginated list of all medications that contain the specified substance, including composition details and latest pricing information if available.
 *     tags: [Substances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Substance ID
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of medications containing the substance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 substance:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     innName:
 *                       type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       suklCode:
 *                         type: string
 *                       name:
 *                         type: string
 *                       strength:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       composition:
 *                         type: object
 *                       latestPrice:
 *                         type: object
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: Substance not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id/medications", validate(substancesQuerySchema), getSubstanceMedicationsController);

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
