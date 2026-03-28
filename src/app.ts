import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import medicationsRoutes from "./routes/medications.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/medications", medicationsRoutes);
app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        service: "sukl-api",
    });
});

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SUKL API",
            version: "1.0.0",
            description: "API providing medication information based on SUKL datasets"
        }
    },
    apis: ["./src/routes/*.ts"]
});

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "sukl-api"
    });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
