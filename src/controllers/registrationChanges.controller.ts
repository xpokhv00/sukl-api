import { Request, Response } from "express";
import { getRegistrationChanges } from "../services/registrationChanges.service";
import { z } from "zod";
import { registrationChangesQuerySchema } from "../schemas/registrationChanges";

type RegistrationChangesQuery = z.infer<typeof registrationChangesQuerySchema>;

export async function listRegistrationChanges(req: Request, res: Response) {
    const result = await getRegistrationChanges(req.parsed_query as RegistrationChangesQuery);
    res.json(result);
}
