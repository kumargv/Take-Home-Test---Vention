// tests/weapon/getWeaponMaxBuildQuantity.test.js

// Mock functions
const testGetMaxBuildQuantity = jest.fn();

// Mock service factory
const mockWeaponService = jest.fn(() => ({
    getMaxBuildQuantity: testGetMaxBuildQuantity
}));

// Setup mocks before imports
jest.mock('../../services/weaponService', () => mockWeaponService);
jest.mock('../../utils/logger', () => jest.fn());

// Mock CORS
jest.mock('cors', () => {
    return jest.fn(() => (req, res, next) => next());
});

const request = require('supertest');
const server = require('../../server.js');

describe('GET /api/weapon/:id/maxBuildQuantity', () => {
    const mockWeapon = {
        id: 1,
        name: 'Test Weapon',
        material_id: 1,
        material_qty: 5,
        status: 'active'
    };

    const mockMaterial = {
        id: 1,
        name: 'Test Material',
        base_power: 25,
        power_level: 30,
        qty: 50,
        deleted_at: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('TestCase 1 - Calculate max build quantity correctly', async () => {
        const mockResponse = {
            weapon: mockWeapon,
            maxBuildQty: 10  // 50 units / 5 per weapon = 10
        };

        testGetMaxBuildQuantity.mockResolvedValue(mockResponse);

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('weapon');
        expect(response.body).toHaveProperty('maxBuildQty');
        expect(response.body.maxBuildQty).toBe(10);
        expect(testGetMaxBuildQuantity).toHaveBeenCalledWith(1);
    });

    test('TestCase 2 - Handle insufficient materials', async () => {
        const mockResponse = {
            weapon: mockWeapon,
            maxBuildQty: 0
        };

        testGetMaxBuildQuantity.mockResolvedValue(mockResponse);

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.maxBuildQty).toBe(0);
    });

    test('TestCase 3 - Return 404 for non-existent weapon', async () => {
        const error = new Error('Weapon not found');
        error.statusCode = 404;
        testGetMaxBuildQuantity.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/weapon/99/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(404);

        expect(response.body).toHaveProperty('message', 'Weapon not found');
    });

    test('TestCase 4 - Handle deleted material', async () => {
        const mockResponse = {
            weapon: mockWeapon,
            maxBuildQty: 0,
            error: 'Material is deleted'
        };

        testGetMaxBuildQuantity.mockResolvedValue(mockResponse);

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.maxBuildQty).toBe(0);
    });

    test('TestCase 5 - Handle zero material cost', async () => {
        const error = new Error('Invalid material cost');
        error.statusCode = 400;
        testGetMaxBuildQuantity.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Invalid material cost');
    });

    test('TestCase 6 - Handle negative material cost', async () => {
        const error = new Error('Invalid material cost');
        error.statusCode = 400;
        testGetMaxBuildQuantity.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Invalid material cost');
    });

    test('TestCase 7 - Handle service errors', async () => {
        testGetMaxBuildQuantity.mockRejectedValue(new Error('Service error'));

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(500);

        expect(response.body).toHaveProperty('message');
    });

    test('TestCase 8 - Calculate with multiple material requirements', async () => {
        const weaponWithMultipleMaterials = {
            ...mockWeapon,
            secondary_material_id: 2,
            secondary_material_qty: 2
        };

        const mockResponse = {
            weapon: weaponWithMultipleMaterials,
            maxBuildQty: 10  // Limited by the most constraining material
        };

        testGetMaxBuildQuantity.mockResolvedValue(mockResponse);

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body.maxBuildQty).toBe(10);
        expect(testGetMaxBuildQuantity).toHaveBeenCalledWith(1);
    });

    test('TestCase 9 - Handle invalid weapon ID format', async () => {
        const error = new Error('Invalid weapon ID format');
        error.statusCode = 400;
        testGetMaxBuildQuantity.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/weapon/invalid-id/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Invalid weapon ID format');
    });

    test('TestCase 10 - Handle weapon with no material requirements', async () => {
        const error = new Error('Weapon has no material requirements');
        error.statusCode = 400;
        testGetMaxBuildQuantity.mockRejectedValue(error);

        const response = await request(server)
            .get('/api/weapon/1/maxBuildQuantity')
            .set('Accept', 'application/json')
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Weapon has no material requirements');
    });
});