import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Substances Endpoints E2E Tests', () => {
  describe('GET /substances', () => {
    it('should return paginated list of substances', async () => {
      const response = await request(app).get('/substances');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should have correct pagination meta structure', async () => {
      const response = await request(app).get('/substances');

      expect(response.status).toBe(200);
      const { meta } = response.body;
      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
    });

    it('should have correct substance data structure', async () => {
      const response = await request(app).get('/substances?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      const substance = response.body.data[0];
      expect(substance).toHaveProperty('id');
      expect(substance).toHaveProperty('name');
    });

    it('should filter by name', async () => {
      const response = await request(app).get('/substances?name=paracetamol');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect page and limit parameters', async () => {
      const response = await request(app).get('/substances?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app).get('/substances?limit=200');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app).get('/substances?page=0');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /substances/:id', () => {
    it('should return substance detail for a valid ID', async () => {
      const listResponse = await request(app).get('/substances?limit=1');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data.length).toBeGreaterThan(0);

      const substanceId = listResponse.body.data[0].id;
      const response = await request(app).get(`/substances/${substanceId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', substanceId);
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent substance ID', async () => {
      const response = await request(app).get('/substances/999999999');

      expect(response.status).toBe(404);
    });
  });
});
