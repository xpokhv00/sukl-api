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
 *     description: Returns a paginated, filterable list of medications with their key reference data.
 *     tags: [Medications]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive name search
 *       - in: query
 *         name: atc
 *         schema: { type: string }
 *         description: ATC code prefix — e.g. `C09` returns all renin-angiotensin agents
 *       - in: query
 *         name: substance
 *         schema: { type: string }
 *         description: Active substance name or INN (case-insensitive)
 *       - in: query
 *         name: form
 *         schema: { type: string }
 *         description: Pharmaceutical form code (e.g. `TBL FLM`)
 *       - in: query
 *         name: dispensing
 *         schema: { type: string }
 *         description: Dispensing category code (e.g. `V` = prescription only)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of medications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/MedicationSummary' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(medicationsQuerySchema), listMedications);

/**
 * @swagger
 * /medications/{suklCode}:
 *   get:
 *     summary: Get a medication by SUKL code
 *     description: Returns full medication detail including compositions, documents, disruptions, price history, dispensing restrictions, and doping entries.
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: suklCode
 *         required: true
 *         schema: { type: string, pattern: '^\d{7}$' }
 *         description: 7-digit SUKL code (e.g. `0217580`)
 *     responses:
 *       200:
 *         description: Full medication detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MedicationDetail' }
 *       400:
 *         description: Invalid SUKL code format
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Medication not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:suklCode", validate(medicationParamsSchema, "params"), getMedication);

/**
 * @swagger
 * /medications/{suklCode}/prescriptions:
 *   get:
 *     summary: Prescription statistics for a medication
 *     description: Returns district-level prescription quantities for the given medication, ordered by quantity descending.
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: suklCode
 *         required: true
 *         schema: { type: string, pattern: '^\d{7}$' }
 *       - in: query
 *         name: districtCode
 *         schema: { type: string }
 *         description: Filter to a specific district
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2026 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated prescription statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Prescription' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Medication not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
    "/:suklCode/prescriptions",
    validate(medicationParamsSchema, "params"),
    validate(prescriptionsQuerySchema.omit({ suklCode: true })),
    listPrescriptions
);

export default router;
