import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('Substances Endpoints E2E Tests', () => {
  describe('GET /substances', () => {
    it('should return paginated list of substances', async () => {
      const response = await request(app).get('/substances');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should have correct substances data structure', async () => {
      const response = await request(app).get('/substances');

      expect(response.status).toBe(200);
      const firstSubstance = response.body.data[0];
      expect(firstSubstance).toHaveProperty('id');
      expect(firstSubstance).toHaveProperty('name');
      expect(firstSubstance).toHaveProperty('innName');
    });

    it('should include pagination metadata', async () => {
      const response = await request(app).get('/substances');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should respect limit parameter', async () => {
      const response = await request(app).get('/substances?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should respect page parameter', async () => {
      const response = await request(app).get('/substances?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
    });

    it('should search substances by name', async () => {
      const response = await request(app).get('/substances?name=IBUPROFEN');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      // At least one result should contain the search term
      const hasMatch = response.body.data.some((substance: any) =>
        substance.name.toUpperCase().includes('IBUPROFEN') ||
        substance.innName.toUpperCase().includes('IBUPROFEN')
      );
      expect(hasMatch).toBe(true);
    });

    it('should handle case-insensitive search', async () => {
      const responseLower = await request(app).get('/substances?name=ibuprofen');
      const responseUpper = await request(app).get('/substances?name=IBUPROFEN');

      expect(responseLower.status).toBe(200);
      expect(responseUpper.status).toBe(200);
      // Both should return results
      expect(responseLower.body.data.length).toBeGreaterThan(0);
      expect(responseUpper.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty list for non-matching search', async () => {
      const response = await request(app).get('/substances?name=ZZZZZNONEXISTENT9999');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should use default pagination values', async () => {
      const response = await request(app).get('/substances');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(20);
    });

    it('should handle invalid limit gracefully', async () => {
      const response = await request(app).get('/substances?limit=invalid');

      expect([200, 400]).toContain(response.status);
    });

    it('should handle invalid page gracefully', async () => {
      const response = await request(app).get('/substances?page=invalid');

      expect([200, 400]).toContain(response.status);
    });

    it('should search synonyms by default (searchSynonyms defaults to true)', async () => {
      const response = await request(app).get('/substances?name=WORMWOOD');

      expect(response.status).toBe(200);
      // WORMWOOD is a synonym for ARTEMISIA ABSINTHIUM, so it should find it
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should not search synonyms when searchSynonyms=false', async () => {
      const responseDefault = await request(app).get('/substances?name=WORMWOOD');
      const responseExplicitFalse = await request(app).get('/substances?name=WORMWOOD&searchSynonyms=false');

      expect(responseDefault.status).toBe(200);
      expect(responseExplicitFalse.status).toBe(200);
      // Searches with false should return fewer or no results
      expect(responseExplicitFalse.body.data.length).toBeLessThanOrEqual(responseDefault.body.data.length);
    });

    it('should order results by match quality (exact match first)', async () => {
      const response = await request(app).get('/substances?name=IBUPROFEN&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // First result should be exact or very close match
      const firstResult = response.body.data[0];
      const searchTerm = 'IBUPROFEN';
      const isExactOrStartsWithMatch = 
        firstResult.name.toUpperCase() === searchTerm ||
        firstResult.name.toUpperCase().startsWith(searchTerm) ||
        firstResult.innName.toUpperCase() === searchTerm ||
        firstResult.innName.toUpperCase().startsWith(searchTerm);
      
      expect(isExactOrStartsWithMatch).toBe(true);
    });

    it('should find substances by synonym and maintain high ranking', async () => {
      const detailResponse = await request(app).get('/substances?limit=100');
      let substanceWithSynonym = null;
      
      for (const substance of detailResponse.body.data) {
        const detail = await request(app).get(`/substances/${substance.id}`);
        if (detail.body.synonyms && detail.body.synonyms.length > 0) {
          substanceWithSynonym = detail.body;
          break;
        }
      }

      if (!substanceWithSynonym || !substanceWithSynonym.synonyms[0]) {
        console.warn('No substance with synonyms found for testing');
        return;
      }

      const synonym = substanceWithSynonym.synonyms[0].name;
      const response = await request(app).get(`/substances?name=${encodeURIComponent(synonym)}&limit=10`);

      expect(response.status).toBe(200);
      const foundIds = response.body.data.map((s: any) => s.id);
      expect(foundIds).toContain(substanceWithSynonym.id);
    });
  });

  describe('GET /substances/{id}', () => {
    let substanceId: string;

    // Get a real substance ID from the list first
    beforeAll(async () => {
      const listResponse = await request(app).get('/substances?limit=1');
      if (listResponse.body.data.length > 0) {
        substanceId = listResponse.body.data[0].id;
      }
    });

    it('should return substance detail by ID', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(substanceId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('innName');
    });

    it('should include synonyms array in detail', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('synonyms');
      expect(Array.isArray(response.body.synonyms)).toBe(true);
    });

    it('should include compositions with medications', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('compositions');
      expect(Array.isArray(response.body.compositions)).toBe(true);
    });

    it('should have correct composition structure', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}`);

      expect(response.status).toBe(200);
      if (response.body.compositions.length > 0) {
        const composition = response.body.compositions[0];
        expect(composition).toHaveProperty('amount');
        expect(composition).toHaveProperty('unit');
        expect(composition).toHaveProperty('type');
        expect(composition).toHaveProperty('medication');
      }
    });

    it('should have correct medication structure in composition', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}`);

      expect(response.status).toBe(200);
      if (response.body.compositions.length > 0) {
        const medication = response.body.compositions[0].medication;
        expect(medication).toHaveProperty('suklCode');
        expect(medication).toHaveProperty('name');
        expect(medication).toHaveProperty('strength');
        expect(medication).toHaveProperty('isActive');
        expect(medication).toHaveProperty('form');
      }
    });

    it('should have correct form structure in medication', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}`);

      expect(response.status).toBe(200);
      if (response.body.compositions.length > 0) {
        const form = response.body.compositions[0].medication.form;
        expect(form).toHaveProperty('code');
        expect(form).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent substance', async () => {
      const response = await request(app).get('/substances/999999999');

      expect(response.status).toBe(404);
    });

    it('should handle non-numeric IDs gracefully', async () => {
      const response = await request(app).get('/substances/INVALID_ID');

      expect([400, 404]).toContain(response.status);
    });

    it('should return known substance IBUPROFENUM if exists', async () => {
      // First search for IBUPROFENUM to get its ID
      const searchResponse = await request(app).get('/substances?name=IBUPROFENUM&limit=1');

      if (searchResponse.body.data.length > 0) {
        const id = searchResponse.body.data[0].id;
        const response = await request(app).get(`/substances/${id}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toContain('IBUPROFEN');
      }
    });
  });

  describe('GET /substances/{id}/medications', () => {
    let substanceId: string | null = null;

    beforeAll(async () => {
      // Find a substance with medications
      const response = await request(app).get('/substances?limit=1');
      if (response.body.data.length > 0) {
        substanceId = response.body.data[0].id;
      }
    });

    it('should return medications containing the substance', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}/medications`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('substance');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should have correct substance info in response', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}/medications`);

      expect(response.status).toBe(200);
      expect(response.body.substance).toHaveProperty('id');
      expect(response.body.substance).toHaveProperty('name');
      expect(response.body.substance.id).toBe(substanceId);
    });

    it('should have correct medication structure', async () => {
      if (!substanceId) {
        console.warn('No substance ID available for testing');
        return;
      }

      const response = await request(app).get(`/substances/${substanceId}/medications`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const med = response.body.data[0];
        expect(med).toHaveProperty('suklCode');
        expect(med).toHaveProperty('name');
        expect(med).toHaveProperty('isActive');
        expect(med).toHaveProperty('composition');
        expect(med).toHaveProperty('latestPrice');
      }
    });
  });
});
