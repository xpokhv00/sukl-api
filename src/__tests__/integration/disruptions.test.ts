import request from "supertest";
import app from "../../app";

describe("Disruptions Endpoints E2E Tests", () => {
  describe("GET /disruptions", () => {
    it("should return paginated list of disruptions", async () => {
      const res = await request(app)
        .get("/disruptions")
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("meta");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should have correct disruption data structure", async () => {
      const res = await request(app)
        .get("/disruptions")
        .expect(200);

      if (res.body.data.length > 0) {
        const disruption = res.body.data[0];
        expect(disruption).toHaveProperty("id");
        expect(disruption).toHaveProperty("type");
        expect(disruption).toHaveProperty("isActive");
        expect(disruption).toHaveProperty("reportedAt");
        expect(disruption).toHaveProperty("medication");
        expect(disruption.medication).toHaveProperty("suklCode");
        expect(disruption.medication).toHaveProperty("name");
      }
    });

    it("should filter by SUKL code", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions?suklCode=${suklCode}`)
          .expect(200);

        expect(res.body.data.every((d: any) => d.medication.suklCode === suklCode)).toBe(true);
      }
    });

    it("should filter by ATC code", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const atcCode = allRes.body.data[0].medication.atcCode;
        if (atcCode) {
          const res = await request(app)
            .get(`/disruptions?atc=${atcCode.substring(0, 3)}`)
            .expect(200);

          if (res.body.data.length > 0) {
            expect(res.body.data.every((d: any) => d.medication.atcCode?.startsWith(atcCode.substring(0, 3)))).toBe(true);
          }
        }
      }
    });

    it("should filter by type", async () => {
      const res = await request(app)
        .get("/disruptions?type=START")
        .expect(200);

      if (res.body.data.length > 0) {
        expect(res.body.data.every((d: any) => d.type === "START")).toBe(true);
      }
    });

    it("should use default pagination values", async () => {
      const res = await request(app)
        .get("/disruptions")
        .expect(200);

      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(20);
    });

    it("should handle invalid limit gracefully", async () => {
      const res = await request(app)
        .get("/disruptions?limit=invalid")
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should handle invalid page gracefully", async () => {
      const res = await request(app)
        .get("/disruptions?page=invalid")
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should handle invalid type gracefully", async () => {
      const res = await request(app)
        .get("/disruptions?type=invalid_type")
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /disruptions/active", () => {
    it("should return paginated list of active disruptions only", async () => {
      const res = await request(app)
        .get("/disruptions/active")
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("meta");
      expect(Array.isArray(res.body.data)).toBe(true);

      // All disruptions should be active
      if (res.body.data.length > 0) {
        expect(res.body.data.every((d: any) => d.isActive === true)).toBe(true);
      }
    });

    it("should have correct active disruption structure", async () => {
      const res = await request(app)
        .get("/disruptions/active")
        .expect(200);

      if (res.body.data.length > 0) {
        const disruption = res.body.data[0];
        expect(disruption).toHaveProperty("id");
        expect(disruption).toHaveProperty("type");
        expect(disruption.isActive).toBe(true);
        expect(disruption).toHaveProperty("reportedAt");
        expect(disruption).toHaveProperty("medication");
      }
    });

    it("should respect limit parameter for active disruptions", async () => {
      const res = await request(app)
        .get("/disruptions/active?limit=5")
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.meta.limit).toBe(5);
    });

    it("should filter active disruptions by SUKL code", async () => {
      const allRes = await request(app).get("/disruptions/active");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions/active?suklCode=${suklCode}`)
          .expect(200);

        expect(res.body.data.every((d: any) => d.medication.suklCode === suklCode && d.isActive)).toBe(true);
      }
    });

    it("should return fewer or equal active disruptions than all disruptions", async () => {
      const allRes = await request(app).get("/disruptions");
      const activeRes = await request(app).get("/disruptions/active");

      expect(activeRes.body.meta.total).toBeLessThanOrEqual(allRes.body.meta.total);
    });

    it("should filter active disruptions by type", async () => {
      const res = await request(app)
        .get("/disruptions/active?type=INTERRUPTION")
        .expect(200);

      if (res.body.data.length > 0) {
        expect(res.body.data.every((d: any) => d.type === "INTERRUPTION" && d.isActive)).toBe(true);
      }
    });
  });
});
