import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import medicationsRoutes from "./routes/medications.routes";
import substancesRoutes from "./routes/substances.routes";
import pharmaciesRoutes from "./routes/pharmacies.routes";
import prescriptionsRoutes from "./routes/prescriptions.routes";
import registrationChangesRoutes from "./routes/registrationChanges.routes";
import disruptionsRoutes from "./routes/disruptions.routes";
import atcRoutes from "./routes/atc.routes";
import metaRoutes from "./routes/meta.routes";
import intermediariesRoutes from "./routes/intermediaries.routes";
import organizationsRoutes from "./routes/organizations.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: "Too many requests, please try again later." } },
}));

app.use("/medications", medicationsRoutes);
app.use("/substances", substancesRoutes);
app.use("/organizations", organizationsRoutes);
app.use("/pharmacies", pharmaciesRoutes);
app.use("/prescriptions", prescriptionsRoutes);
app.use("/registration-changes", registrationChangesRoutes);
app.use("/disruptions", disruptionsRoutes);
app.use("/atc", atcRoutes);
app.use("/meta", metaRoutes);
app.use("/intermediaries", intermediariesRoutes);

app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        service: "sukl-api",
        endpoints: ["/medications", "/substances", "/organizations", "/pharmacies", "/prescriptions", "/registration-changes", "/disruptions", "/atc", "/meta", "/intermediaries", "/docs"],
    });
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "sukl-api" });
});

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SUKL API",
            version: "1.0.0",
            description: "API providing medication information based on SUKL datasets",
        },
    },
    apis: ["./src/routes/*.ts"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
