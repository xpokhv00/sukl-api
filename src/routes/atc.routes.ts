import { Router } from "express";
import { listAtcNodes, getAtc } from "../controllers/atc.controller";

const router = Router();

/**
 * @swagger
 * /atc:
 *   get:
 *     summary: List ATC nodes
 *     description: Browse the ATC classification tree level by level. Omit `parent` to get top-level anatomical groups (A–V). Pass a code to get its direct children.
 *     tags: [ATC]
 *     parameters:
 *       - in: query
 *         name: parent
 *         schema: { type: string }
 *         description: Parent ATC code (e.g. `C09` to list its subgroups). Omit for root nodes.
 *     responses:
 *       200:
 *         description: List of ATC nodes at the requested level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/AtcNode' }
 */
router.get("/", listAtcNodes);

/**
 * @swagger
 * /atc/{code}:
 *   get:
 *     summary: Get an ATC node
 *     description: Returns the node, its direct children, and the count of medications whose ATC code starts with this code.
 *     tags: [ATC]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         description: ATC code — case-insensitive (e.g. `C09A` or `c09a`)
 *     responses:
 *       200:
 *         description: ATC node with children and medication count
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AtcNodeDetail' }
 *       404:
 *         description: ATC code not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:code", getAtc);

export default router;
