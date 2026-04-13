import { Router } from "express";
import { getDisruptions, getActiveDisruptions, getActiveDisruptionsWithReplacement, getDisruptionHistory, getReplacementAlternatives } from "../controllers/disruptions.controller";
import { validate } from "../middleware/validate";
import { disruptionsQuerySchema, disruptionsActiveQuerySchema } from "../schemas/disruptions";

const router = Router();

/**
 * @swagger
 * /disruptions:
 *   get:
 *     summary: List all medication disruptions/reports
 *     description: Returns all medication disruption reports (availability interruptions, terminations, resumptions). Filterable by ATC, medication code, type, and date range.
 *     tags: [Disruptions]
 *     parameters:
 *       - in: query
 *         name: atc
 *         schema: { type: string }
 *         description: Filter by ATC code prefix
 *       - in: query
 *         name: suklCode
 *         schema: { type: string }
 *         description: Filter by medication SUKL code
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: ["START", "INTERRUPTION", "ENDED", "RESUMED"] }
 *         description: Filter by disruption type (start, interruption, ended, resumed)
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *         description: Filter reports from this date (RFC 3339 format)
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *         description: Filter reports until this date (RFC 3339 format)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of disruptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       type: { type: string }
 *                       reason: { type: string, nullable: true }
 *                       isActive: { type: boolean }
 *                       reportedAt: { type: string, format: date-time }
 *                       startDate: { type: string, format: date-time, nullable: true }
 *                       endDate: { type: string, format: date-time, nullable: true }
 *                       medication:
 *                         type: object
 *                         properties:
 *                           suklCode: { type: string }
 *                           name: { type: string }
 *                           atcCode: { type: string, nullable: true }
 *                           isActive: { type: boolean }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(disruptionsQuerySchema), getDisruptions);

/**
 * @swagger
 * /disruptions/active/with-replacement:
 *   get:
 *     summary: List currently active medication disruptions with replacement information
 *     description: Returns active disruption reports with replacement medication details and a flag indicating if the replacement is also disrupted.
 *     tags: [Disruptions]
 *     parameters:
 *       - in: query
 *         name: atc
 *         schema: { type: string }
 *         description: Filter by ATC code prefix
 *       - in: query
 *         name: suklCode
 *         schema: { type: string }
 *         description: Filter by medication SUKL code
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: ["START", "INTERRUPTION", "ENDED", "RESUMED"] }
 *         description: Filter by disruption type
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *         description: Filter reports from this date (RFC 3339 format)
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *         description: Filter reports until this date (RFC 3339 format)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of active disruptions with replacement details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       type: { type: string }
 *                       reason: { type: string, nullable: true }
 *                       isActive: { type: boolean }
 *                       reportedAt: { type: string, format: date-time }
 *                       startDate: { type: string, format: date-time, nullable: true }
 *                       endDate: { type: string, format: date-time, nullable: true }
 *                       medication:
 *                         type: object
 *                         properties:
 *                           suklCode: { type: string }
 *                           name: { type: string }
 *                           atcCode: { type: string, nullable: true }
 *                           isActive: { type: boolean }
 *                       replacement:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           suklCode: { type: string }
 *                           name: { type: string }
 *                           isActive: { type: boolean }
 *                       replacementIsAlsoDisrupted: { type: boolean, nullable: true }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/active/with-replacement", validate(disruptionsActiveQuerySchema), getActiveDisruptionsWithReplacement);

/**
 * @swagger
 * /disruptions/active:
 *   get:
 *     summary: List currently active medication disruptions
 *     description: Returns only active medication disruption reports (where POSLEDNI_PLATNE_HLASENI=ANO). Filterable by ATC, medication code, type, and date range.
 *     tags: [Disruptions]
 *     parameters:
 *       - in: query
 *         name: atc
 *         schema: { type: string }
 *         description: Filter by ATC code prefix
 *       - in: query
 *         name: suklCode
 *         schema: { type: string }
 *         description: Filter by medication SUKL code
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: ["START", "INTERRUPTION", "ENDED", "RESUMED"] }
 *         description: Filter by disruption type (start, interruption, ended, resumed)
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *         description: Filter reports from this date (RFC 3339 format)
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *         description: Filter reports until this date (RFC 3339 format)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of active disruptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       type: { type: string }
 *                       reason: { type: string, nullable: true }
 *                       isActive: { type: boolean }
 *                       reportedAt: { type: string, format: date-time }
 *                       startDate: { type: string, format: date-time, nullable: true }
 *                       endDate: { type: string, format: date-time, nullable: true }
 *                       medication:
 *                         type: object
 *                         properties:
 *                           suklCode: { type: string }
 *                           name: { type: string }
 *                           atcCode: { type: string, nullable: true }
 *                           isActive: { type: boolean }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/active", validate(disruptionsActiveQuerySchema), getActiveDisruptions);

/**
 * @swagger
 * /disruptions/{suklCode}/replacement:
 *   get:
 *     summary: Get replacement alternatives for a medication
 *     description: Returns the recommended replacement from active disruption reports and other alternative medications with the same ATC code.
 *     tags: [Disruptions]
 *     parameters:
 *       - in: path
 *         name: suklCode
 *         required: true
 *         schema: { type: string }
 *         description: Medication SUKL code
 *     responses:
 *       200:
 *         description: Recommended and alternative medications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommended:
 *                   type: object
 *                   nullable: true
 *                   description: Recommended replacement from disruption report
 *                   properties:
 *                     suklCode: { type: string }
 *                     name: { type: string }
 *                     atcCode: { type: string, nullable: true }
 *                     isActive: { type: boolean }
 *                 other:
 *                   type: array
 *                   description: Alternative medications with same ATC code
 *                   items:
 *                     type: object
 *                     properties:
 *                       suklCode: { type: string }
 *                       name: { type: string }
 *                       atcCode: { type: string, nullable: true }
 *                       isActive: { type: boolean }
 */
router.get("/:suklCode/replacement", getReplacementAlternatives);

/**
 * @swagger
 * /disruptions/{suklCode}:
 *   get:
 *     summary: Get disruption history for a specific medication
 *     description: Returns all disruption reports (past and present) for a specific medication (SUKL code), including both active and inactive records.
 *     tags: [Disruptions]
 *     parameters:
 *       - in: path
 *         name: suklCode
 *         required: true
 *         schema: { type: string }
 *         description: Medication SUKL code
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of all disruption records for the medication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       type: { type: string }
 *                       reason: { type: string, nullable: true }
 *                       isActive: { type: boolean }
 *                       reportedAt: { type: string, format: date-time }
 *                       startDate: { type: string, format: date-time, nullable: true }
 *                       endDate: { type: string, format: date-time, nullable: true }
 *                       replacementSuklCode: { type: string, nullable: true }
 *                       medication:
 *                         type: object
 *                         properties:
 *                           suklCode: { type: string }
 *                           name: { type: string }
 *                           atcCode: { type: string, nullable: true }
 *                           isActive: { type: boolean }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:suklCode", getDisruptionHistory);

export default router;
