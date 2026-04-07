import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import medicationsRoutes from "./routes/medications.routes";
import substancesRoutes from "./routes/substances.routes";
import pharmaciesRoutes from "./routes/pharmacies.routes";
import prescriptionsRoutes from "./routes/prescriptions.routes";
import atcRoutes from "./routes/atc.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/medications", medicationsRoutes);
app.use("/substances", substancesRoutes);
app.use("/pharmacies", pharmaciesRoutes);
app.use("/prescriptions", prescriptionsRoutes);
app.use("/atc", atcRoutes);

app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        service: "sukl-api",
        endpoints: ["/medications", "/substances", "/pharmacies", "/prescriptions", "/atc", "/docs"],
    });
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

app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "sukl-api" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
