import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app";

describe("Statistics Endpoints E2E Tests", () => {
  describe("GET /statistics/supply-risk", () => {
    it("should return supply risk statistics", async () => {
      const response = await request(app).get("/statistics/supply-risk");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("meta");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should have correct response structure for each item", async () => {
      const response = await request(app).get("/statistics/supply-risk?limit=5");

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty("atcCode");
        expect(item).toHaveProperty("atcName");
        expect(item).toHaveProperty("activeDisruptions");
        expect(item).toHaveProperty("totalPrescriptions");
        expect(item).toHaveProperty("riskScore");
        expect(typeof item.activeDisruptions).toBe("number");
        expect(typeof item.totalPrescriptions).toBe("number");
        expect(typeof item.riskScore).toBe("number");
      }
    });

    it("should be sorted by risk score descending", async () => {
      const response = await request(app).get("/statistics/supply-risk?limit=10");

      expect(response.status).toBe(200);
      if (response.body.data.length > 1) {
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].riskScore).toBeGreaterThanOrEqual(
            response.body.data[i + 1].riskScore
          );
        }
      }
    });
  });
});
