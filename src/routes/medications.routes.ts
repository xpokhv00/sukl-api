import { Router } from "express";
import { listMedications, getMedication } from "../controllers/medications.controller";

const router = Router();

/**
 * @swagger
 * /medications:
 *   get:
 *     summary: List medications
 *     tags: [Medications]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by name (case-insensitive contains)
 *       - in: query
 *         name: atc
 *         schema: { type: string }
 *         description: Filter by ATC code prefix (e.g. "C09" for all ACE inhibitors)
 *       - in: query
 *         name: substance
 *         schema: { type: string }
 *         description: Filter by active substance name or INN name
 *       - in: query
 *         name: form
 *         schema: { type: string }
 *         description: Filter by pharmaceutical form code
 *       - in: query
 *         name: dispensing
 *         schema: { type: string }
 *         description: Filter by dispensing category code
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of medications
 */
router.get("/", listMedications);

/**
 * @swagger
 * /medications/{suklCode}:
 *   get:
 *     summary: Get a medication by SUKL code
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: suklCode
 *         required: true
 *         schema: { type: string }
 *         description: 7-digit SUKL code
 *     responses:
 *       200:
 *         description: Full medication detail with all relations
 *       404:
 *         description: Medication not found
 */
router.get("/:suklCode", getMedication);

export default router;
