import { Router } from "express";
import { listAtcNodes, getAtc } from "../controllers/atc.controller";

const router = Router();

/**
 * @swagger
 * /atc:
 *   get:
 *     summary: List ATC nodes
 *     tags: [ATC]
 *     parameters:
 *       - in: query
 *         name: parent
 *         schema: { type: string }
 *         description: Parent ATC code — omit for top-level nodes
 *     responses:
 *       200:
 *         description: List of ATC nodes at the requested level
 */
router.get("/", listAtcNodes);

/**
 * @swagger
 * /atc/{code}:
 *   get:
 *     summary: Get an ATC node with its children and medication count
 *     tags: [ATC]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: ATC node with children and medicationCount
 *       404:
 *         description: ATC code not found
 */
router.get("/:code", getAtc);

export default router;
