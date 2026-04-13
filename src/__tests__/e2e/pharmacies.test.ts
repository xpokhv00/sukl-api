import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Pharmacies Endpoints E2E Tests', () => {
  describe('GET /pharmacies', () => {
    it('should return paginated list of pharmacies', async () => {
      const response = await request(app).get('/pharmacies');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should have correct pagination meta structure', async () => {
      const response = await request(app).get('/pharmacies');

      expect(response.status).toBe(200);
      const { meta } = response.body;
      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
    });

    it('should have correct pharmacy data structure', async () => {
      const response = await request(app).get('/pharmacies?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      const pharmacy = response.body.data[0];
      expect(pharmacy).toHaveProperty('id');
      expect(pharmacy).toHaveProperty('name');
    });

    it('should filter by name', async () => {
      const response = await request(app).get('/pharmacies?name=lékárna');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by city', async () => {
      const response = await request(app).get('/pharmacies?city=Praha');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by postal code prefix', async () => {
      const response = await request(app).get('/pharmacies?postalCode=110');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by isMailOrder=true', async () => {
      const response = await request(app).get('/pharmacies?isMailOrder=true');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by isDuty=true', async () => {
      const response = await request(app).get('/pharmacies?isDuty=true');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 for invalid isMailOrder value', async () => {
      const response = await request(app).get('/pharmacies?isMailOrder=yes');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid isDuty value', async () => {
      const response = await request(app).get('/pharmacies?isDuty=1');

      expect(response.status).toBe(400);
    });

    it('should respect page and limit parameters', async () => {
      const response = await request(app).get('/pharmacies?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app).get('/pharmacies?limit=200');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app).get('/pharmacies?page=0');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /pharmacies/:id', () => {
    it('should return pharmacy detail for a valid ID', async () => {
      const listResponse = await request(app).get('/pharmacies?limit=1');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data.length).toBeGreaterThan(0);

      const pharmacyId = listResponse.body.data[0].id;
      const response = await request(app).get(`/pharmacies/${pharmacyId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', pharmacyId);
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent pharmacy ID', async () => {
      const response = await request(app).get('/pharmacies/NONEXISTENT00000');

      expect(response.status).toBe(404);
    });
  });
});
