import { Router } from "express";
import {
  getFormsController,
  getRoutesController,
  getDispensingCategoriesController,
  getRegistrationStatusesController,
  getDopingCategoriesController,
  getDependencyCategoriesController,
  getMedicationTypesController,
  getIndicationGroupsController,
  getNarcoticCategoriesController,
  getPharmacyTypesController,
} from "../controllers/meta.controller";

const router = Router();

/**
 * @swagger
 * /meta/pharmaceutical-forms:
 *   get:
 *     summary: Get all pharmaceutical forms
 *     description: Returns a list of all pharmaceutical forms (tablets, capsules, injections, etc.)
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of pharmaceutical forms
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
 *                       code: { type: string }
 *                       name: { type: string }
 *                       edqmCode: { type: string, nullable: true }
 */
router.get("/pharmaceutical-forms", getFormsController);

/**
 * @swagger
 * /meta/administration-routes:
 *   get:
 *     summary: Get all administration routes
 *     description: Returns a list of all administration routes (oral, intravenous, topical, etc.)
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of administration routes
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
 *                       code: { type: string }
 *                       name: { type: string }
 *                       edqmCode: { type: string, nullable: true }
 */
router.get("/administration-routes", getRoutesController);

/**
 * @swagger
 * /meta/dispensing-categories:
 *   get:
 *     summary: Get all dispensing categories
 *     description: Returns a list of all dispensing categories
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of dispensing categories
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
 *                       code: { type: string }
 *                       name: { type: string }
 */
router.get("/dispensing-categories", getDispensingCategoriesController);

/**
 * @swagger
 * /meta/registration-statuses:
 *   get:
 *     summary: Get all registration statuses
 *     description: Returns a list of all registration statuses
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of registration statuses
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
 *                       code: { type: string }
 *                       name: { type: string }
 */
router.get("/registration-statuses", getRegistrationStatusesController);

/**
 * @swagger
 * /meta/doping-categories:
 *   get:
 *     summary: Get all doping categories
 *     description: Returns a list of all doping categories
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of doping categories
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
 *                       code: { type: string }
 *                       name: { type: string }
 */
router.get("/doping-categories", getDopingCategoriesController);

/**
 * @swagger
 * /meta/dependency-categories:
 *   get:
 *     summary: Get all dependency categories
 *     description: Returns a list of all dependency categories
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of dependency categories
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
 *                       code: { type: string }
 *                       name: { type: string }
 */
router.get("/dependency-categories", getDependencyCategoriesController);

/**
 * @swagger
 * /meta/medication-types:
 *   get:
 *     summary: Get all medication types
 *     description: Returns a list of all medication types
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of medication types
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
 *                       code: { type: string }
 *                       name: { type: string }
 */
router.get("/medication-types", getMedicationTypesController);

/**
 * @swagger
 * /meta/indication-groups:
 *   get:
 *     summary: Get all indication groups
 *     description: Returns a list of all indication groups
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of indication groups
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
 *                       code: { type: string }
 *                       name: { type: string }
 */
router.get("/indication-groups", getIndicationGroupsController);

/**
 * @swagger
 * /meta/narcotic-categories:
 *   get:
 *     summary: Get all narcotic categories
 *     description: Returns a list of all narcotic categories
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of narcotic categories
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
 *                       code: { type: string }
 *                       name: { type: string }
 */
router.get("/narcotic-categories", getNarcoticCategoriesController);

/**
 * @swagger
 * /meta/pharmacy-types:
 *   get:
 *     summary: Get all pharmacy types
 *     description: Returns a list of all pharmacy types available in the system
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: List of pharmacy types
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
 *                       name: { type: string }
 */
router.get("/pharmacy-types", getPharmacyTypesController);

export default router;
