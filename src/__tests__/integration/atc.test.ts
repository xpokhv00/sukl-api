import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('ATC Endpoints E2E Tests', () => {
  describe('GET /atc', () => {
    it('should return list of ATC nodes', async () => {
      const response = await request(app).get('/atc');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should have correct ATC data structure', async () => {
      const response = await request(app).get('/atc');

      expect(response.status).toBe(200);
      const firstNode = response.body.data[0];
      expect(firstNode).toHaveProperty('code');
      expect(firstNode).toHaveProperty('name');
      expect(firstNode).toHaveProperty('level');
    });
  });

  describe('GET /atc/:code', () => {
    it('should return ATC node by code', async () => {
      const response = await request(app).get('/atc/A');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 'A');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('level');
    });

    it('should return 404 for non-existent code', async () => {
      const response = await request(app).get('/atc/ZZZZ9999');

      expect(response.status).toBe(404);
    });

    it('should handle case-insensitive codes', async () => {
      const response = await request(app).get('/atc/a');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('A');
    });
  });
});
