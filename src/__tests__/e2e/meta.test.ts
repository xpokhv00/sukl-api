import request from "supertest";
import app from "../../app";

describe("Meta Endpoints", () => {
  test("GET /meta/pharmaceutical-forms returns data", async () => {
    const response = await request(app).get("/meta/pharmaceutical-forms");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/administration-routes returns data", async () => {
    const response = await request(app).get("/meta/administration-routes");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/dispensing-categories returns data", async () => {
    const response = await request(app).get("/meta/dispensing-categories");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/registration-statuses returns data", async () => {
    const response = await request(app).get("/meta/registration-statuses");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/doping-categories returns data", async () => {
    const response = await request(app).get("/meta/doping-categories");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/dependency-categories returns data", async () => {
    const response = await request(app).get("/meta/dependency-categories");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/medication-types returns data", async () => {
    const response = await request(app).get("/meta/medication-types");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/indication-groups returns data", async () => {
    const response = await request(app).get("/meta/indication-groups");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/narcotic-categories returns data", async () => {
    const response = await request(app).get("/meta/narcotic-categories");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /meta/pharmacy-types returns data", async () => {
    const response = await request(app).get("/meta/pharmacy-types");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
