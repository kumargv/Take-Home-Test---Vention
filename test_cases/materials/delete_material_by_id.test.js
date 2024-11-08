// tests/material/deleteMaterial.test.js

// Mock functions
const testRemove = jest.fn();

// Mock service factory
const mockMaterialService = jest.fn(() => ({
    remove: testRemove
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

describe('DELETE /api/material/:id', () => {
    // Mock data
    const mockParentMaterial = {
        id: 1,
        name: 'Parent Test Material',
        base_power: 100,
        power_level: 100,
        qty: 75,
        deleted_at: null
    };

    const testMaterial = {
        id: 2,
        name: 'Test Material 1',
        base_power: 25,
        power_level: 30,
        qty: 20,
        parent_id: 1,
        deleted_at: null
    };

    const testSubMaterial = {
        id: 3,
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
        material_id: 2,
        status: 'active'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('TestCase 1 - Successfully soft delete a material', async () => {
        const mockResponse = {
            deleted_materials: [
                { ...testMaterial, deleted_at: new Date() }
            ]
        };

        testRemove.mockResolvedValue(mockResponse);

        const response = await request(server)
            .delete('/api/material/2')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('deleted_materials');
        expect(Array.isArray(response.body.deleted_materials)).toBeTruthy();
        expect(testRemove).toHaveBeenCalledWith(2);
    });

    test('TestCase 2 - Delete Sub material cascade', async () => {
        const mockResponse = {
            deleted_materials: [
                { ...testMaterial, deleted_at: new Date() },
                { ...testSubMaterial, deleted_at: new Date() }
            ]
        };

        testRemove.mockResolvedValue(mockResponse);

        const response = await request(server)
            .delete('/api/material/2')
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.deleted_materials.length).toBeGreaterThanOrEqual(2);
        expect(testRemove).toHaveBeenCalledWith(2);
    });

    test('TestCase 3 - Update related weapons status to broken', async () => {
        const mockResponse = {
            deleted_materials: [
                { ...testMaterial, deleted_at: new Date() }
            ],
            broken_weapons: [
                { ...testWeapon, status: 'broken' }
            ]
        };

        testRemove.mockResolvedValue(mockResponse);

        const response = await request(server)
            .delete('/api/material/2')
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.broken_weapons).toContainEqual(
            expect.objectContaining({ id: testWeapon.id, status: 'broken' })
        );
    });

    test('TestCase 4 - Return 404 for non-existent material', async () => {
        const error = new Error('Material not found');
        error.statusCode = 404;
        testRemove.mockRejectedValue(error);

        const response = await request(server)
            .delete('/api/material/99')
            .set('Accept', 'application/json')
            .expect(404);

        expect(response.body).toHaveProperty('message', 'Material not found');
    });

    test('TestCase 5 - Handle already deleted material', async () => {
        const error = new Error('Material already deleted');
        error.statusCode = 404;
        testRemove.mockRejectedValue(error);

        const response = await request(server)
            .delete('/api/material/2')
            .set('Accept', 'application/json')
            .expect(404);

        expect(response.body).toHaveProperty('message', 'Material already deleted');
    });

    test('TestCase 6 - Not affect parent material when deleting sub material', async () => {
        const mockResponse = {
            deleted_materials: [
                { ...testSubMaterial, deleted_at: new Date() }
            ]
        };

        testRemove.mockResolvedValue(mockResponse);

        const response = await request(server)
            .delete('/api/material/3')
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.deleted_materials).toHaveLength(1);
        expect(response.body.deleted_materials[0].id).toBe(testSubMaterial.id);
    });

    test('TestCase 7 - Handle service errors', async () => {
        testRemove.mockRejectedValue(new Error('Service error'));

        const response = await request(server)
            .delete('/api/material/2')
            .set('Accept', 'application/json')
            .expect(500);

        expect(response.body).toHaveProperty('message');
    });

    test('TestCase 8 - Update multiple weapons', async () => {
        const mockResponse = {
            deleted_materials: [
                { ...testMaterial, deleted_at: new Date() }
            ],
            broken_weapons: [
                { ...testWeapon, status: 'broken' },
                { ...testWeapon, id: 2, name: 'Test Weapon 2', status: 'broken' }
            ]
        };

        testRemove.mockResolvedValue(mockResponse);

        const response = await request(server)
            .delete('/api/material/2')
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.broken_weapons.length).toBe(2);
        expect(response.body.broken_weapons).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ status: 'broken' })
            ])
        );
    });

    test('TestCase 9 - Handle invalid ID format', async () => {
        const error = new Error('Invalid ID format');
        error.statusCode = 400;
        testRemove.mockRejectedValue(error);

        const response = await request(server)
            .delete('/api/material/invalid-id')
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Invalid ID format');
    });

    test('TestCase 10 - Rollback changes if DELETE operation failed', async () => {
        const error = new Error('Service error');
        error.statusCode = 500;
        testRemove.mockRejectedValue(error);

        const response = await request(server)
            .delete('/api/material/2')
            .set('Accept', 'application/json')
            .expect(500);

        expect(response.body).toHaveProperty('message');
        expect(testRemove).toHaveBeenCalledTimes(1);
    });
});