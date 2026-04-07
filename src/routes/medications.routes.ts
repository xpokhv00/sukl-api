import { Router } from "express";
import { listMedications, getMedication } from "../controllers/medications.controller";
import { listPrescriptions } from "../controllers/prescriptions.controller";
import { validate } from "../middleware/validate";
import { medicationsQuerySchema, medicationParamsSchema } from "../schemas/medications";
import { prescriptionsQuerySchema } from "../schemas/prescriptions";

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
 *         description: Filter by ATC code prefix (e.g. "C09")
 *       - in: query
 *         name: substance
 *         schema: { type: string }
 *         description: Filter by active substance name or INN
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
 *       400:
 *         description: Invalid query parameters
 */
router.get("/", validate(medicationsQuerySchema), listMedications);

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
 *         schema: { type: string, pattern: '^\d{7}$' }
 *     responses:
 *       200:
 *         description: Full medication detail with all relations
 *       404:
 *         description: Medication not found
 */
router.get("/:suklCode", validate(medicationParamsSchema, "params"), getMedication);

/**
 * @swagger
 * /medications/{suklCode}/prescriptions:
 *   get:
 *     summary: Get prescription statistics for a specific medication
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: suklCode
 *         required: true
 *         schema: { type: string, pattern: '^\d{7}$' }
 *       - in: query
 *         name: districtCode
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated prescription statistics for this medication
 *       400:
 *         description: Invalid parameters
 */
router.get(
    "/:suklCode/prescriptions",
    validate(medicationParamsSchema, "params"),
    validate(prescriptionsQuerySchema.omit({ suklCode: true })),
    listPrescriptions
);

export default router;
