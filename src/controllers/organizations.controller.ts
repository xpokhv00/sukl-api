import { Request, Response } from "express";
import {
    getOrganizations,
    getOrganizationByCode,
    getOrganizationMedications,
    getOrganizationDisruptions,
} from "../services/organizations.service";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";
import {
    organizationsQuerySchema,
    organizationMedicationsQuerySchema,
    organizationDisruptionsQuerySchema,
} from "../schemas/organizations";

type OrganizationsQuery = z.infer<typeof organizationsQuerySchema>;
type OrgMedicationsQuery = z.infer<typeof organizationMedicationsQuerySchema>;
type OrgDisruptionsQuery = z.infer<typeof organizationDisruptionsQuerySchema>;

export async function listOrganizations(req: Request, res: Response) {
    const result = await getOrganizations(req.parsed_query as OrganizationsQuery);
    res.json(result);
}

export async function getOrganization(req: Request, res: Response) {
    const organization = await getOrganizationByCode(req.params.code as string);
    if (!organization) throw new AppError(404, "Organization not found");
    res.json(organization);
}

export async function getOrganizationMedicationsHandler(req: Request, res: Response) {
    const result = await getOrganizationMedications({
        code: req.params.code as string,
        ...(req.parsed_query as OrgMedicationsQuery),
    });
    res.json(result);
}

export async function getOrganizationDisruptionsHandler(req: Request, res: Response) {
    const result = await getOrganizationDisruptions({
        code: req.params.code as string,
        ...(req.parsed_query as OrgDisruptionsQuery),
    });
    res.json(result);
}
