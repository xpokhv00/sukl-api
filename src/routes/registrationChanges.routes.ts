import { Router } from "express";
import { listRegistrationChanges } from "../controllers/registrationChanges.controller";
import { validate } from "../middleware/validate";
import { registrationChangesQuerySchema } from "../schemas/registrationChanges";

const router = Router();

/**
 * @swagger
 * /registration-changes:
 *   get:
 *     summary: List registration changes (new, cancelled, or EU-cancelled medications)
 *     tags: [Registration Changes]
 *     parameters:
 *       - in: query
 *         name: changeType
 *         schema: { type: string, enum: [NEW, CANCELLED, CANCELLED_EU] }
 *         description: Filter by change type
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by medication name
 *       - in: query
 *         name: holder
 *         schema: { type: string }
 *         description: Filter by marketing authorisation holder
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of registration changes
 *       400:
 *         description: Invalid query parameters
 */
router.get("/", validate(registrationChangesQuerySchema), listRegistrationChanges);

export default router;
