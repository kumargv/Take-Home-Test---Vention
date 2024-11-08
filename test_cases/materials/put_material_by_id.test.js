// tests/material/updateMaterial.test.js

// Mock functions
const testUpdate = jest.fn();

// Mock service factory
const mockMaterialService = jest.fn(() => ({
    update: testUpdate
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

describe('PUT /api/material/:id', () => {
    const testMaterial = {
        id: 1,
        name: 'Test Material 1',
        base_power: 25,
        power_level: 30,
        qty: 20,
        deleted_at: null
    };

    const testSubMaterial = {
        id: 2,
        name: 'Test Material 2',
        base_power: 20,
        power_level: 25,
        qty: 15,
        parent_id: 1,
        deleted_at: null
    };

    const testWeapon = {
        id: 1,
        name: 'Test Weapon',
        material_id: 1,
        status: 'active'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('TestCase 1 - Successfully update material properties', async () => {
        const updateData = {
            power_level: 75,
            qty: 100
        };

        const mockResponse = {
            updated_materials: [
                { ...testMaterial, ...updateData }
            ]
        };

        testUpdate.mockResolvedValue(mockResponse);

        const response = await request(server)
            .put('/api/material/1')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('updated_materials');
        expect(Array.isArray(response.body.updated_materials)).toBeTruthy();
        expect(testUpdate).toHaveBeenCalledWith(1, updateData);
    });

    test('TestCase 2 - Update Sub material power levels', async () => {
        const updateData = {
            power_level: 100
        };

        const mockResponse = {
            updated_materials: [
                { ...testMaterial, power_level: 100 },
                { ...testSubMaterial, power_level: 85 }
            ]
        };

        testUpdate.mockResolvedValue(mockResponse);

        const response = await request(server)
            .put('/api/material/1')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.updated_materials[1].power_level).toBeGreaterThan(80);
        expect(testUpdate).toHaveBeenCalledWith(1, updateData);
    });

    test('TestCase 3 - Reject negative values', async () => {
        const updateData = {
            qty: -10
        };

        const error = new Error('Quantity cannot be negative');
        error.statusCode = 400;
        testUpdate.mockRejectedValue(error);

        const response = await request(server)
            .put('/api/material/1')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Quantity cannot be negative');
    });

    test('TestCase 4 - Update non-existent material', async () => {
        const updateData = {
            power_level: 120,
            qty: 35
        };

        const error = new Error('Material not found');
        error.statusCode = 404;
        testUpdate.mockRejectedValue(error);

        const response = await request(server)
            .put('/api/material/99')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect(404);

        expect(response.body).toHaveProperty('message', 'Material not found');
    });

    test('TestCase 5 - Partial Updates correctly', async () => {
        const updateData = {
            qty: 86
        };

        const mockResponse = {
            updated_materials: [
                { ...testMaterial, qty: 86 }
            ]
        };

        testUpdate.mockResolvedValue(mockResponse);

        const response = await request(server)
            .put('/api/material/1')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.updated_materials[0].qty).toBe(86);
        expect(response.body.updated_materials[0].power_level).toBe(30);
        expect(testUpdate).toHaveBeenCalledWith(1, updateData);
    });

    test('TestCase 6 - Validate data types', async () => {
        const updateData = {
            power_level: 'invalid',
            qty: 'invalid'
        };

        const error = new Error('Invalid data type for power_level or quantity');
        error.statusCode = 400;
        testUpdate.mockRejectedValue(error);

        const response = await request(server)
            .put('/api/material/1')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Invalid data type for power_level or quantity');
    });

    test('TestCase 7 - Handle service errors', async () => {
        const updateData = {
            power_level: 65,
            qty: 80
        };

        testUpdate.mockRejectedValue(new Error('Service error'));

        const response = await request(server)
            .put('/api/material/1')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect(500);

        expect(response.body).toHaveProperty('message');
    });

    test('TestCase 8 - Handle empty payload', async () => {
        const error = new Error('No update data provided');
        error.statusCode = 400;
        testUpdate.mockRejectedValue(error);

        const response = await request(server)
            .put('/api/material/1')
            .send({})
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'No update data provided');
    });

    test('TestCase 9 - Verify update propagation', async () => {
        const updateData = {
            power_level: 75,
            qty: 100
        };

        const mockResponse = {
            updated_materials: [
                { ...testMaterial, ...updateData },
                { ...testSubMaterial, power_level: 65 }
            ]
        };

        testUpdate.mockResolvedValue(mockResponse);

        const response = await request(server)
            .put('/api/material/1')
            .send(updateData)
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.updated_materials).toHaveLength(2);
        expect(response.body.updated_materials[1].power_level).toBe(65);
    });
});