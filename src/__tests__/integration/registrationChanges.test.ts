import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Registration Changes Endpoints E2E Tests', () => {
  describe('GET /registration-changes', () => {
    it('should return paginated list of registration changes', async () => {
      const response = await request(app).get('/registration-changes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should have correct pagination meta structure', async () => {
      const response = await request(app).get('/registration-changes');

      expect(response.status).toBe(200);
      const { meta } = response.body;
      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
    });

    it('should have correct registration change data structure', async () => {
      const response = await request(app).get('/registration-changes?limit=1');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const change = response.body.data[0];
        expect(change).toHaveProperty('changeType');
        expect(change).toHaveProperty('name');
      }
    });

    it('should filter by changeType NEW', async () => {
      const response = await request(app).get('/registration-changes?changeType=NEW');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((c: any) => {
        expect(c.changeType).toBe('NEW');
      });
    });

    it('should filter by changeType CANCELLED', async () => {
      const response = await request(app).get('/registration-changes?changeType=CANCELLED');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((c: any) => {
        expect(c.changeType).toBe('CANCELLED');
      });
    });

    it('should filter by changeType CANCELLED_EU', async () => {
      const response = await request(app).get('/registration-changes?changeType=CANCELLED_EU');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((c: any) => {
        expect(c.changeType).toBe('CANCELLED_EU');
      });
    });

    it('should filter by name', async () => {
      const response = await request(app).get('/registration-changes?name=aspirin');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by holder', async () => {
      const response = await request(app).get('/registration-changes?holder=bayer');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect page and limit parameters', async () => {
      const response = await request(app).get('/registration-changes?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return 400 for invalid changeType', async () => {
      const response = await request(app).get('/registration-changes?changeType=INVALID');

      expect(response.status).toBe(400);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app).get('/registration-changes?limit=200');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app).get('/registration-changes?page=0');

      expect(response.status).toBe(400);
    });
  });
});
