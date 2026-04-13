import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Organizations Endpoints E2E Tests', () => {
  describe('GET /organizations', () => {
    it('should return paginated list of organizations', async () => {
      const response = await request(app).get('/organizations');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('code');
        expect(response.body.data[0]).toHaveProperty('name');
      }
    });

    it('should filter by organization name', async () => {
      const response = await request(app).get('/organizations?name=TEVA');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by country code', async () => {
      const response = await request(app).get('/organizations?country=CZ');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app).get('/organizations?limit=200');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /organizations/:code', () => {
    it('should return organization detail for a valid code', async () => {
      const listResponse = await request(app).get('/organizations?limit=1');
      expect(listResponse.status).toBe(200);

      if (listResponse.body.data.length > 0) {
        const orgCode = listResponse.body.data[0].code;
        const response = await request(app).get(`/organizations/${orgCode}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('code', orgCode);
        expect(response.body).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent organization code', async () => {
      const response = await request(app).get('/organizations/NONEXISTENT');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /organizations/:code/medications', () => {
    it('should return paginated list of organization medications', async () => {
      const listResponse = await request(app).get('/organizations?limit=1');
      expect(listResponse.status).toBe(200);

      if (listResponse.body.data.length > 0) {
        const orgCode = listResponse.body.data[0].code;
        const response = await request(app).get(`/organizations/${orgCode}/medications`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const listResponse = await request(app).get('/organizations?limit=1');
      expect(listResponse.status).toBe(200);

      if (listResponse.body.data.length > 0) {
        const orgCode = listResponse.body.data[0].code;
        const response = await request(app).get(`/organizations/${orgCode}/medications?limit=200`);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('GET /organizations/:code/disruptions', () => {
    it('should return paginated list of active disruptions', async () => {
      const listResponse = await request(app).get('/organizations?limit=1');
      expect(listResponse.status).toBe(200);

      if (listResponse.body.data.length > 0) {
        const orgCode = listResponse.body.data[0].code;
        const response = await request(app).get(`/organizations/${orgCode}/disruptions`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const listResponse = await request(app).get('/organizations?limit=1');
      expect(listResponse.status).toBe(200);

      if (listResponse.body.data.length > 0) {
        const orgCode = listResponse.body.data[0].code;
        const response = await request(app).get(`/organizations/${orgCode}/disruptions?limit=200`);

        expect(response.status).toBe(400);
      }
    });
  });
});
