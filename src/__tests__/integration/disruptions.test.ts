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

  describe("GET /disruptions/active/with-replacement", () => {
    it("should return active disruptions with replacement info", async () => {
      const res = await request(app)
        .get("/disruptions/active/with-replacement")
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("meta");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should include replacement medication info when available", async () => {
      const res = await request(app)
        .get("/disruptions/active/with-replacement")
        .expect(200);

      if (res.body.data.length > 0) {
        const disruptionWithReplacement = res.body.data.find((d: any) => d.replacementSuklCode);
        if (disruptionWithReplacement) {
          expect(disruptionWithReplacement).toHaveProperty("replacement");
          expect(disruptionWithReplacement).toHaveProperty("replacementIsAlsoDisrupted");
          if (disruptionWithReplacement.replacement) {
            expect(disruptionWithReplacement.replacement).toHaveProperty("suklCode");
            expect(disruptionWithReplacement.replacement).toHaveProperty("name");
          }
        }
      }
    });

    it("should track if replacement is also disrupted", async () => {
      const res = await request(app)
        .get("/disruptions/active/with-replacement")
        .expect(200);

      if (res.body.data.length > 0) {
        const disruption = res.body.data[0];
        if (disruption.replacement) {
          expect(disruption.replacementIsAlsoDisrupted).toEqual(expect.any(Boolean));
        }
      }
    });

    it("should respect pagination parameters", async () => {
      const res = await request(app)
        .get("/disruptions/active/with-replacement?limit=5&page=1")
        .expect(200);

      expect(res.body.meta.limit).toBe(5);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should filter by type", async () => {
      const res = await request(app)
        .get("/disruptions/active/with-replacement?type=START")
        .expect(200);

      if (res.body.data.length > 0) {
        expect(res.body.data.every((d: any) => d.type === "START" && d.isActive)).toBe(true);
      }
    });
  });

  describe("GET /disruptions/{suklCode}", () => {
    it("should return disruption history for specific medication", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions/${suklCode}`)
          .expect(200);

        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("meta");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.every((d: any) => d.medication.suklCode === suklCode)).toBe(true);
      }
    });

    it("should return all records (active and inactive) for medication", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;

        const activeRes = await request(app).get(`/disruptions?suklCode=${suklCode}&limit=100`);
        const historyRes = await request(app).get(`/disruptions/${suklCode}?limit=100`);

        // History should have >= active records (includes inactive too)
        expect(historyRes.body.meta.total).toBeGreaterThanOrEqual(activeRes.body.meta.total);
      }
    });

    it("should support pagination for disruption history", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;

        const page1 = await request(app).get(`/disruptions/${suklCode}?limit=5&page=1`);
        expect(page1.body.meta.limit).toBe(5);
        expect(page1.body.meta.page).toBe(1);
        expect(page1.body.data.length).toBeLessThanOrEqual(5);
      }
    });

    it("should order records by reported date descending", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;

        const res = await request(app).get(`/disruptions/${suklCode}?limit=100`);

        if (res.body.data.length > 1) {
          for (let i = 0; i < res.body.data.length - 1; i++) {
            const current = new Date(res.body.data[i].reportedAt).getTime();
            const next = new Date(res.body.data[i + 1].reportedAt).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }
        }
      }
    });

    it("should include replacement info in history", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions/${suklCode}`)
          .expect(200);

        if (res.body.data.length > 0) {
          const disruptionWithReplacement = res.body.data.find((d: any) => d.replacementSuklCode);
          if (disruptionWithReplacement) {
            expect(disruptionWithReplacement).toHaveProperty("replacementSuklCode");
          }
        }
      }
    });
  });

  describe("GET /disruptions/:suklCode/replacement", () => {
    it("should return replacement alternatives structure", async () => {
      const allRes = await request(app).get("/disruptions");
      if (allRes.body.data.length > 0) {
        const suklCode = allRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions/${suklCode}/replacement`)
          .expect(200);

        expect(res.body).toHaveProperty("recommended");
        expect(res.body).toHaveProperty("other");
        expect(Array.isArray(res.body.other)).toBe(true);
      }
    });

    it("should return null recommended if no active disruption", async () => {
      const medicationsRes = await request(app).get("/medications");
      if (medicationsRes.body.data && medicationsRes.body.data.length > 0) {
        const suklCode = medicationsRes.body.data[0].suklCode;
        const res = await request(app)
          .get(`/disruptions/${suklCode}/replacement`)
          .expect(200);

        // recommended may be null if no active disruption for this medication
        if (res.body.recommended === null) {
          expect(res.body.recommended).toBeNull();
        } else {
          expect(res.body.recommended).toHaveProperty("suklCode");
          expect(res.body.recommended).toHaveProperty("name");
        }
      }
    });

    it("should return other medications with same ATC code", async () => {
      const disruptionsRes = await request(app).get("/disruptions");
      if (disruptionsRes.body.data.length > 0) {
        const suklCode = disruptionsRes.body.data[0].medication.suklCode;
        const medicationRes = await request(app).get(`/medications/${suklCode}`);
        const atcCode = medicationRes.body.atcCode;

        if (atcCode) {
          const res = await request(app)
            .get(`/disruptions/${suklCode}/replacement`)
            .expect(200);

          if (res.body.other && res.body.other.length > 0) {
            res.body.other.forEach((med: any) => {
              expect(med).toHaveProperty("suklCode");
              expect(med).toHaveProperty("name");
              expect(med.atcCode).toBe(atcCode);
              expect(med.suklCode).not.toBe(suklCode); // Should not include the original medication
            });
          }
        }
      }
    });

    it("should exclude original medication from other list", async () => {
      const disruptionsRes = await request(app).get("/disruptions");
      if (disruptionsRes.body.data.length > 0) {
        const suklCode = disruptionsRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions/${suklCode}/replacement`)
          .expect(200);

        res.body.other.forEach((med: any) => {
          expect(med.suklCode).not.toBe(suklCode);
        });
      }
    });

    it("should exclude recommended from other list", async () => {
      const disruptionsRes = await request(app).get("/disruptions?limit=100");
      const withReplacement = disruptionsRes.body.data.find((d: any) => d.replacementSuklCode);

      if (withReplacement) {
        const res = await request(app)
          .get(`/disruptions/${withReplacement.medication.suklCode}/replacement`)
          .expect(200);

        if (res.body.recommended) {
          const recommendedInOther = res.body.other.find((m: any) => m.suklCode === res.body.recommended.suklCode);
          expect(recommendedInOther).toBeUndefined();
        }
      }
    });

    it("should sort other medications alphabetically by name", async () => {
      const disruptionsRes = await request(app).get("/disruptions");
      if (disruptionsRes.body.data.length > 0) {
        const suklCode = disruptionsRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions/${suklCode}/replacement`)
          .expect(200);

        if (res.body.other && res.body.other.length > 1) {
          for (let i = 0; i < res.body.other.length - 1; i++) {
            expect(res.body.other[i].name.localeCompare(res.body.other[i + 1].name)).toBeLessThanOrEqual(0);
          }
        }
      }
    });

    it("should have correct medication structure for recommended", async () => {
      const disruptionsRes = await request(app).get("/disruptions?limit=100");
      const withReplacement = disruptionsRes.body.data.find((d: any) => d.replacementSuklCode);

      if (withReplacement) {
        const res = await request(app)
          .get(`/disruptions/${withReplacement.medication.suklCode}/replacement`)
          .expect(200);

        if (res.body.recommended) {
          expect(res.body.recommended).toHaveProperty("suklCode");
          expect(res.body.recommended).toHaveProperty("name");
          expect(res.body.recommended).toHaveProperty("atcCode");
          expect(res.body.recommended).toHaveProperty("isActive");
        }
      }
    });

    it("should have correct medication structure for other items", async () => {
      const disruptionsRes = await request(app).get("/disruptions");
      if (disruptionsRes.body.data.length > 0) {
        const suklCode = disruptionsRes.body.data[0].medication.suklCode;
        const res = await request(app)
          .get(`/disruptions/${suklCode}/replacement`)
          .expect(200);

        if (res.body.other && res.body.other.length > 0) {
          res.body.other.forEach((med: any) => {
            expect(med).toHaveProperty("suklCode");
            expect(med).toHaveProperty("name");
            expect(med).toHaveProperty("atcCode");
            expect(med).toHaveProperty("isActive");
          });
        }
      }
    });
  });
});
