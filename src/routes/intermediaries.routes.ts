import { Router } from "express";
import { listIntermediaries, getIntermediary } from "../controllers/intermediaries.controller";
import { validate } from "../middleware/validate";
import { intermediariesQuerySchema, intermediaryParamsSchema } from "../schemas/intermediaries";

const router = Router();

/**
 * @swagger
 * /intermediaries:
 *   get:
 *     summary: List distribution intermediaries
 *     description: Returns registry of Czech distribution intermediaries (zprostředkovatelé). Filter by name or city with pagination.
 *     tags: [Intermediaries]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive name search
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Filter by city (case-insensitive)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of intermediaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Intermediary' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(intermediariesQuerySchema), listIntermediaries);

/**
 * @swagger
 * /intermediaries/{ic}:
 *   get:
 *     summary: Get intermediary by IČ
 *     description: Returns full intermediary details by identification number (IČ).
 *     tags: [Intermediaries]
 *     parameters:
 *       - in: path
 *         name: ic
 *         required: true
 *         schema: { type: string }
 *         description: Intermediary identification number (IČ)
 *     responses:
 *       200:
 *         description: Intermediary detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Intermediary' }
 *       404:
 *         description: Intermediary not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:ic", validate(intermediaryParamsSchema, "params"), getIntermediary);

export default router;
