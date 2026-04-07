import { Router } from "express";
import { listRegistrationChanges } from "../controllers/registrationChanges.controller";
import { validate } from "../middleware/validate";
import { registrationChangesQuerySchema } from "../schemas/registrationChanges";

const router = Router();

/**
 * @swagger
 * /registration-changes:
 *   get:
 *     summary: List registration changes
 *     description: New registrations, cancelled registrations, and EU-cancelled registrations published by SÚKL (Feb 2026 dataset).
 *     tags: [Registration Changes]
 *     parameters:
 *       - in: query
 *         name: changeType
 *         schema: { type: string, enum: [NEW, CANCELLED, CANCELLED_EU] }
 *         description: "`NEW` = newly registered, `CANCELLED` = national cancellation, `CANCELLED_EU` = EU-level cancellation"
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive medication name search
 *       - in: query
 *         name: holder
 *         schema: { type: string }
 *         description: Case-insensitive marketing authorisation holder search
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of registration changes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/RegistrationChange' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(registrationChangesQuerySchema), listRegistrationChanges);

export default router;
