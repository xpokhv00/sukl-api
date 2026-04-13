import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Prescriptions Endpoints E2E Tests', () => {
  describe('GET /prescriptions', () => {
    it('should return paginated list of prescriptions', async () => {
      const response = await request(app).get('/prescriptions');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should have correct pagination meta structure', async () => {
      const response = await request(app).get('/prescriptions');

      expect(response.status).toBe(200);
      const { meta } = response.body;
      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
    });

    it('should have correct prescription data structure', async () => {
      const response = await request(app).get('/prescriptions?limit=1');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const prescription = response.body.data[0];
        expect(prescription).toHaveProperty('suklCode');
        expect(prescription).toHaveProperty('districtCode');
      }
    });

    it('should filter by suklCode', async () => {
      const medResponse = await request(app).get('/prescriptions?limit=1');
      expect(medResponse.status).toBe(200);

      if (medResponse.body.data.length > 0) {
        const { suklCode } = medResponse.body.data[0];
        const response = await request(app).get(`/prescriptions?suklCode=${suklCode}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        response.body.data.forEach((p: any) => {
          expect(p.suklCode).toBe(suklCode);
        });
      }
    });

    it('should filter by districtCode', async () => {
      const response = await request(app).get('/prescriptions?districtCode=3100');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by year', async () => {
      const response = await request(app).get('/prescriptions?year=2026');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by year and month', async () => {
      const response = await request(app).get('/prescriptions?year=2026&month=2');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect page and limit parameters', async () => {
      const response = await request(app).get('/prescriptions?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return 400 for invalid suklCode format', async () => {
      const response = await request(app).get('/prescriptions?suklCode=123');

      expect(response.status).toBe(400);
    });

    it('should return 400 for month out of range', async () => {
      const response = await request(app).get('/prescriptions?month=13');

      expect(response.status).toBe(400);
    });

    it('should return 400 for month below minimum', async () => {
      const response = await request(app).get('/prescriptions?month=0');

      expect(response.status).toBe(400);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app).get('/prescriptions?limit=200');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app).get('/prescriptions?page=0');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /prescriptions/total', () => {
    it('should return total ', async () => {
      const response = await request(app).get('/prescriptions/total');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('filters');
      expect(typeof response.body.total).toBe('number');
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should filter by suklCode and return total', async () => {
      const response = await request(app).get('/prescriptions/total?suklCode=0010602');

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.filters.suklCode).toBe('0010602');
    });
    it('should filter by year and month', async () => {
      const response = await request(app).get('/prescriptions/total?year=2026&month=2');

      expect(response.status).toBe(200);
      expect(typeof response.body.total).toBe('number');
      expect(response.body.filters).toEqual({ year: 2026, month: 2 });
    });

    it('should filter by suklCode, year, and month', async () => {
      const response = await request(app).get('/prescriptions/total?suklCode=0010602&year=2026&month=2');

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.filters).toEqual({
        suklCode: '0010602',
        year: 2026,
        month: 2,
      });
    });

    it('should return error for non-existent year', async () => {
      const response = await request(app).get('/prescriptions/total?year=9999');

      expect(response.status).toBe(400);
    });
  });
});
