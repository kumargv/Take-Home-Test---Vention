// Mock functions
const testGetAll = jest.fn();

// Mock service factory
const mockMaterialService = jest.fn(() => ({
    getAll: testGetAll,
}));

// Setup mocks before imports
jest.mock('../../services/materialService', () => mockMaterialService);
jest.mock('../../utils/logger', () => jest.fn());

// Mock CORS
jest.mock('cors', () => {
    return jest.fn(() => (req, res, next) => next());
});

const request = require('supertest');
const server = require('../../server.js');

describe('Material Routes', () => {
    // Test data
    const testMaterials = [
        {
            id: 1,
            name: 'Test Material 1',
            base_power: 25,
            power_level: 30,
            qty: 20
        },
        {
            id: 2,
            name: 'Test Material 2',
            base_power: 50,
            power_level: 60,
            qty: 25
        },
        {
            id: 3,
            name: 'Test Material 3',
            base_power: 60,
            power_level: 50,
            qty: 20
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/material', () => {
        test('TestCase 1 - Successfully retrieve materials', async () => {
            testGetAll.mockResolvedValue(testMaterials);

            const response = await request(server)
                .get('/api/material')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body).toHaveLength(3);
            expect(response.body[0]).toHaveProperty('name');
            expect(testGetAll).toHaveBeenCalled();
        });

        test('TestCase 2 - Return empty array when no materials', async () => {
            testGetAll.mockResolvedValue([]);

            const response = await request(server)
                .get('/api/material')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body).toHaveLength(0);
        });

        test('TestCase 3 - Filter materials by power level', async () => {
            const filteredMaterials = testMaterials.filter(m => m.power_level > 35);
            testGetAll.mockResolvedValue(filteredMaterials);

            const response = await request(server)
                .get('/api/material?power_level_gt=35')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(2);
            response.body.forEach(material => {
                expect(material.power_level).toBeGreaterThan(35);
            });
        });

        test('TestCase 4 - Sort materials by power level in descending order', async () => {
            const sortedMaterials = [...testMaterials].sort((a, b) => b.power_level - a.power_level);
            testGetAll.mockResolvedValue(sortedMaterials);

            const response = await request(server)
                .get('/api/material?sort=power_level:desc')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            const power_levels = response.body.map(m => m.power_level);
            expect(power_levels).toEqual([60, 50, 30]);
        });

        test('TestCase 5 - Handle service error with custom status code', async () => {
            const error = new Error('Service error');
            error.statusCode = 400;
            testGetAll.mockRejectedValue(error);

            const response = await request(server)
                .get('/api/material')
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Service error');
        });

        test('TestCase 6 - Handle service error with default 500 status code', async () => {
            testGetAll.mockRejectedValue(new Error('Internal error'));

            const response = await request(server)
                .get('/api/material')
                .set('Accept', 'application/json');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Internal error');
        });

        test('TestCase 7 - Handle invalid query parameters gracefully', async () => {
            testGetAll.mockResolvedValue(testMaterials);

            const response = await request(server)
                .get('/api/material?invalid_param=value')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(3);
        });
    });
});