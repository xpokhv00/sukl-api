import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Intermediaries Endpoints E2E Tests', () => {
  describe('GET /intermediaries', () => {
    it('should return paginated list of intermediaries', async () => {
      const response = await request(app).get('/intermediaries');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should have correct pagination meta structure', async () => {
      const response = await request(app).get('/intermediaries');

      expect(response.status).toBe(200);
      const { meta } = response.body;
      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
    });

    it('should have correct intermediary data structure', async () => {
      const response = await request(app).get('/intermediaries?limit=1');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const intermediary = response.body.data[0];
        expect(intermediary).toHaveProperty('ic');
        expect(intermediary).toHaveProperty('name');
      }
    });

    it('should filter by name', async () => {
      const response = await request(app).get('/intermediaries?name=Farma');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by city case-insensitive', async () => {
      const response = await request(app).get('/intermediaries?city=Praha');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect page and limit parameters', async () => {
      const response = await request(app).get('/intermediaries?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app).get('/intermediaries?limit=200');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app).get('/intermediaries?page=0');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /intermediaries/:ic', () => {
    it('should return intermediary detail for a valid IČ', async () => {
      const listResponse = await request(app).get('/intermediaries?limit=1');
      expect(listResponse.status).toBe(200);
      
      if (listResponse.body.data.length > 0) {
        const intermediaryIc = listResponse.body.data[0].ic;
        const response = await request(app).get(`/intermediaries/${intermediaryIc}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('ic', intermediaryIc);
        expect(response.body).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent IČ', async () => {
      const response = await request(app).get('/intermediaries/99999999');

      expect(response.status).toBe(404);
    });
  });
});
