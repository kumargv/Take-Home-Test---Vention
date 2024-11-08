// tests/material/getMaterialById.test.js

// Mock functions
const testGet = jest.fn();

// Mock service factory
const mockMaterialService = jest.fn(() => ({
    get: testGet
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

describe('GET /api/material/:id', () => {
    // Test data
    const testMaterial = {
        id: 1,
        name: 'Test Material 1',
        base_power: 25,
        power_level: 30,
        qty: 20,
        deleted_at: null
    };

    const testMaterialWithRelations = {
        id: 1,
        name: 'Test Material 1',
        base_power: 25,
        power_level: 30,
        qty: 20,
        deleted_at: null,
        Weapons: [{  
            id: 1,
            name: 'Test Weapon',
            material_id: 1,
            status: 'active'
        }],
        SubMaterials: [{ 
            id: 2,
            name: 'Test Material 2',
            base_power: 20,
            power_level: 25,
            qty: 15,
            parent_id: 1,
            deleted_at: null
        }]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('TestCase 1 - Successfully retrieve material by id', async () => {
        testGet.mockResolvedValue(testMaterial);

        const response = await request(server)
            .get('/api/material/1')
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.type).toMatch(/json/);
        expect(response.body).toHaveProperty('id', testMaterial.id);
        expect(response.body).toHaveProperty('name', 'Test Material 1');
        expect(response.body).toHaveProperty('base_power', 25);
        expect(response.body).toHaveProperty('power_level', 30);
        expect(response.body).toHaveProperty('qty', 20);
        expect(testGet).toHaveBeenCalledWith(1);
    });

    test('TestCase 2 - Return 404 for non-existent material', async () => {
        const error = new Error('Material not found');
        error.statusCode = 404;
        testGet.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/material/99')
            .set('Accept', 'application/json');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Material not found');
    });

    test('TestCase 3 - Handle invalid ID format', async () => {
        const error = new Error('Invalid ID format');
        error.statusCode = 400;
        testGet.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/material/invalid-id')
            .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid ID format');
    });

    test('TestCase 4 - Should include related weapons when requested', async () => {
        testGet.mockResolvedValue(testMaterialWithRelations);

        const response = await request(server)
            .get('/api/material/1')
            .query({ include: 'weapons' }) 
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Weapons');  
        expect(Array.isArray(response.body.Weapons)).toBeTruthy();
        expect(response.body.Weapons.length).toBe(1);
        expect(response.body.Weapons[0]).toHaveProperty('name', 'Test Weapon');
        expect(response.body.Weapons[0]).toHaveProperty('status', 'active');
    });

    test('TestCase 5 - Include Sub Materials when requested', async () => {
        testGet.mockResolvedValue(testMaterialWithRelations);

        const response = await request(server)
            .get('/api/material/1')
            .query({ include: 'submaterials' })  
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('SubMaterials'); 
        expect(Array.isArray(response.body.SubMaterials)).toBeTruthy();
        expect(response.body.SubMaterials.length).toBe(1);
        expect(response.body.SubMaterials[0]).toHaveProperty('name', 'Test Material 2');
    });

    test('TestCase 6 - Handle service errors', async () => {
        testGet.mockRejectedValue(new Error('Service error'));

        const response = await request(server)
            .get('/api/material/1')
            .set('Accept', 'application/json');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message');
    });

    test('TestCase 7 - Handle multiple includes', async () => {
        testGet.mockResolvedValue(testMaterialWithRelations);

        const response = await request(server)
            .get('/api/material/1')
            .query({ include: 'weapons,submaterials' })
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Weapons');
        expect(response.body).toHaveProperty('SubMaterials');
        expect(Array.isArray(response.body.Weapons)).toBeTruthy();
        expect(Array.isArray(response.body.SubMaterials)).toBeTruthy();
    });

    test('TestCase 8 - Handle invalid includes', async () => {
        const error = new Error('Invalid include parameter');
        error.statusCode = 400;
        testGet.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/material/1')
            .query({ include: 'invalid' })
            .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid include parameter');
    });
});