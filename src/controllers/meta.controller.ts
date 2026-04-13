import { Request, Response } from "express";
import {
  getPharmaceuticalForms,
  getAdministrationRoutes,
  getDispensingCategories,
  getRegistrationStatuses,
  getDopingCategories,
  getDependencyCategories,
  getMedicationTypes,
  getIndicationGroups,
  getNarcoticCategories,
  getPharmacyTypes,
} from "../services/meta.service";

export async function getFormsController(req: Request, res: Response) {
  const data = await getPharmaceuticalForms();
  res.json({ data });
}

export async function getRoutesController(req: Request, res: Response) {
  const data = await getAdministrationRoutes();
  res.json({ data });
}

export async function getDispensingCategoriesController(req: Request, res: Response) {
  const data = await getDispensingCategories();
  res.json({ data });
}

export async function getRegistrationStatusesController(req: Request, res: Response) {
  const data = await getRegistrationStatuses();
  res.json({ data });
}

export async function getDopingCategoriesController(req: Request, res: Response) {
  const data = await getDopingCategories();
  res.json({ data });
}

export async function getDependencyCategoriesController(req: Request, res: Response) {
  const data = await getDependencyCategories();
  res.json({ data });
}

export async function getMedicationTypesController(req: Request, res: Response) {
  const data = await getMedicationTypes();
  res.json({ data });
}

export async function getIndicationGroupsController(req: Request, res: Response) {
  const data = await getIndicationGroups();
  res.json({ data });
}

export async function getNarcoticCategoriesController(req: Request, res: Response) {
  const data = await getNarcoticCategories();
  res.json({ data });
}

export async function getPharmacyTypesController(req: Request, res: Response) {
  const data = await getPharmacyTypes();
  res.json({ data });
}
