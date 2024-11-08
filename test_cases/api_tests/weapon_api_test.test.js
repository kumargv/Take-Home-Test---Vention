// test_cases/weapon/weaponApiTests.test.js

// Mock functions
const testGetAll = jest.fn();
const testGetMaxBuildQuantity = jest.fn();

// Mock service factory
const mockWeaponService = jest.fn(() => ({
    getAll: testGetAll,
    getMaxBuildQuantity: testGetMaxBuildQuantity
}));

// Setup mocks
jest.mock('../../services/weaponService', () => mockWeaponService);
jest.mock('../../utils/logger', () => jest.fn());

const request = require('supertest');
const server = require('../../server');

describe('Weapons API Endpoints', () => {
    const testMaterial = {
        id: 1,
        name: 'Steel',
        base_power: 100,
        power_level: 100,
        qty: 50
    };

    const testWeapon = {
        id: 1,
        name: 'Steel Sword',
        material_id: 1,
        power: 150,
        status: 'active'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/weapon', () => {
        test('TestCase 1 - Should fetch all weapons', async () => {
            const testResponse = [
                { ...testWeapon }
            ];

            testGetAll.mockResolvedValue(testResponse);

            const response = await request(server)
                .get('/api/weapon')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('name', 'Steel Sword');
            expect(testGetAll).toHaveBeenCalled();
        });

        test('TestCase 2 - Should handle empty weapons list', async () => {
            testGetAll.mockResolvedValue([]);

            const response = await request(server)
                .get('/api/weapon')
                .set('Accept', 'application/json')
                .expect(200);

            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(0);
        });

        test('TestCase 3 - Should include material information', async () => {
            const testResponseWithMaterial = [
                {
                    ...testWeapon,
                    material: testMaterial
                }
            ];

            testGetAll.mockResolvedValue(testResponseWithMaterial);

            const response = await request(server)
                .get('/api/weapon')
                .query({ include: 'material' })
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body[0]).toHaveProperty('material');
            expect(response.body[0].material).toHaveProperty('name', 'Steel');
        });

        test('TestCase 4 - Should handle service errors', async () => {
            testGetAll.mockRejectedValue(new Error('Service error'));

            const response = await request(server)
                .get('/api/weapon')
                .set('Accept', 'application/json')
                .expect(500);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('GET /api/weapon/:id/maxBuildQuantity', () => {
        test('TestCase 5 - Should calculate max build quantity correctly', async () => {
            const testResponse = {
                weapon: testWeapon,
                maxBuildQty: 10
            };

            testGetMaxBuildQuantity.mockResolvedValue(testResponse);

            const response = await request(server)
                .get('/api/weapon/1/maxBuildQuantity')
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body).toHaveProperty('weapon');
            expect(response.body).toHaveProperty('maxBuildQty');
            expect(typeof response.body.maxBuildQty).toBe('number');
            expect(testGetMaxBuildQuantity).toHaveBeenCalledWith(1);
        });

        test('TestCase 6 - Should handle weapon without material', async () => {
            const error = new Error('Weapon has no material');
            error.statusCode = 400;
            testGetMaxBuildQuantity.mockRejectedValue(error);

            const response = await request(server)
                .get('/api/weapon/1/maxBuildQuantity')
                .set('Accept', 'application/json')
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Weapon has no material');
        });

        test('TestCase 7 - Should return 0 for insufficient materials', async () => {
            const testResponse = {
                weapon: testWeapon,
                maxBuildQty: 0
            };

            testGetMaxBuildQuantity.mockResolvedValue(testResponse);

            const response = await request(server)
                .get('/api/weapon/1/maxBuildQuantity')
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body.maxBuildQty).toBe(0);
        });

        test('TestCase 8 - Should return 404 for non-existent weapon', async () => {
            const error = new Error('Weapon not found');
            error.statusCode = 404;
            testGetMaxBuildQuantity.mockRejectedValue(error);

            const response = await request(server)
                .get('/api/weapon/99999/maxBuildQuantity')
                .set('Accept', 'application/json')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Weapon not found');
        });

        test('TestCase 9 - Should handle broken weapons', async () => {
            const error = new Error('Weapon is broken');
            error.statusCode = 400;
            testGetMaxBuildQuantity.mockRejectedValue(error);

            const response = await request(server)
                .get('/api/weapon/1/maxBuildQuantity')
                .set('Accept', 'application/json')
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Weapon is broken');
        });

        test('TestCase 10 - Should include detailed material information', async () => {
            const testResponse = {
                weapon: testWeapon,
                maxBuildQty: 10,
                materials: [{
                    ...testMaterial,
                    available_qty: 50
                }]
            };

            testGetMaxBuildQuantity.mockResolvedValue(testResponse);

            const response = await request(server)
                .get('/api/weapon/1/maxBuildQuantity')
                .query({ detailed: 'true' })
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body).toHaveProperty('materials');
            expect(response.body.materials[0]).toHaveProperty('name', 'Steel');
            expect(response.body.materials[0]).toHaveProperty('available_qty');
        });

        test('TestCase 11 - Should handle invalid weapon ID format', async () => {
            const error = new Error('Invalid weapon ID format');
            error.statusCode = 400;
            testGetMaxBuildQuantity.mockRejectedValue(error);

            const response = await request(server)
                .get('/api/weapon/invalid/maxBuildQuantity')
                .set('Accept', 'application/json')
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Invalid weapon ID format');
        });
    });
});