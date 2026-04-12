import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Medications Endpoints E2E Tests', () => {
  describe('GET /medications', () => {
    it('should return paginated list of medications', async () => {
      const response = await request(app).get('/medications');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should have correct pagination meta structure', async () => {
      const response = await request(app).get('/medications');

      expect(response.status).toBe(200);
      const { meta } = response.body;
      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
    });

    it('should have correct medication data structure', async () => {
      const response = await request(app).get('/medications?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      const med = response.body.data[0];
      expect(med).toHaveProperty('suklCode');
      expect(med).toHaveProperty('name');
    });

    it('should filter by name', async () => {
      const response = await request(app).get('/medications?name=aspirin');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by ATC code prefix', async () => {
      const response = await request(app).get('/medications?atc=A');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should filter by substance name', async () => {
      const response = await request(app).get('/medications?substance=paracetamol');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should respect page and limit parameters', async () => {
      const response = await request(app).get('/medications?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app).get('/medications?limit=200');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app).get('/medications?page=0');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /medications/:suklCode', () => {
    it('should return medication detail for valid SUKL code', async () => {
      // First, get a valid suklCode from the list
      const listResponse = await request(app).get('/medications?limit=1');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data.length).toBeGreaterThan(0);

      const suklCode = listResponse.body.data[0].suklCode;
      const response = await request(app).get(`/medications/${suklCode}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suklCode', suklCode);
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent SUKL code', async () => {
      const response = await request(app).get('/medications/0000000');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid SUKL code format (not 7 digits)', async () => {
      const response = await request(app).get('/medications/123');

      expect(response.status).toBe(400);
    });

    it('should return 400 for SUKL code with letters', async () => {
      const response = await request(app).get('/medications/ABC1234');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /medications/:suklCode/prescriptions', () => {
    it('should return prescriptions for a valid medication', async () => {
      const listResponse = await request(app).get('/medications?limit=1');
      const suklCode = listResponse.body.data[0].suklCode;
      const response = await request(app).get(`/medications/${suklCode}/prescriptions`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter prescriptions by year and month', async () => {
      const listResponse = await request(app).get('/medications?limit=1');
      const suklCode = listResponse.body.data[0].suklCode;
      const response = await request(app).get(`/medications/${suklCode}/prescriptions?year=2026&month=2`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 for invalid month', async () => {
      const listResponse = await request(app).get('/medications?limit=1');
      const suklCode = listResponse.body.data[0].suklCode;
      const response = await request(app).get(`/medications/${suklCode}/prescriptions?month=13`);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid SUKL code in prescriptions route', async () => {
      const response = await request(app).get('/medications/123/prescriptions');

      expect(response.status).toBe(400);
    });
  });
});
