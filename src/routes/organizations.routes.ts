import { Router } from "express";
import {
    listOrganizations,
    getOrganization,
    getOrganizationMedicationsHandler,
    getOrganizationDisruptionsHandler,
} from "../controllers/organizations.controller";
import { validate } from "../middleware/validate";
import {
    organizationsQuerySchema,
    organizationParamsSchema,
    organizationMedicationsQuerySchema,
    organizationDisruptionsQuerySchema,
} from "../schemas/organizations";

const router = Router();

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: List organizations
 *     description: Returns Czech medication holders (holders of registrations). Filter by name or country code with pagination.
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive organization name search
 *       - in: query
 *         name: country
 *         schema: { type: string }
 *         description: Filter by country code (e.g., CZ)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Organization' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", validate(organizationsQuerySchema), listOrganizations);

/**
 * @swagger
 * /organizations/{code}:
 *   get:
 *     summary: Get organization by code
 *     description: Returns full organization details.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         description: Organization code
 *     responses:
 *       200:
 *         description: Organization detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Organization' }
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:code", validate(organizationParamsSchema, "params"), getOrganization);

/**
 * @swagger
 * /organizations/{code}/medications:
 *   get:
 *     summary: Get medications of an organization
 *     description: Returns portfolio of medications held by organization (active and historical registrations).
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         description: Organization code
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of organization medications
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
router.get(
    "/:code/medications",
    validate(organizationParamsSchema, "params"),
    validate(organizationMedicationsQuerySchema),
    getOrganizationMedicationsHandler
);

/**
 * @swagger
 * /organizations/{code}/disruptions:
 *   get:
 *     summary: Get active disruptions of an organization
 *     description: Returns active disruptions (supply issues) affecting organization's medication portfolio.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         description: Organization code
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
 *                   items: { $ref: '#/components/schemas/Disruption' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
    "/:code/disruptions",
    validate(organizationParamsSchema, "params"),
    validate(organizationDisruptionsQuerySchema),
    getOrganizationDisruptionsHandler
);

export default router;
