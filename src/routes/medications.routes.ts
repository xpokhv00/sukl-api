import { Router } from "express";
import { listMedications } from "../controllers/medications.controller";

const router = Router();

router.get("/", listMedications);

export default router;
