// test_cases/composition/compositionApiTests.test.js

// Mock functions
const testCreate = jest.fn();
const testUpdate = jest.fn();
const testRemove = jest.fn();

// Mock service factory
const mockCompositionService = jest.fn(() => ({
    create: testCreate,
    update: testUpdate,
    remove: testRemove
}));

// Setup mocks
jest.mock('../../services/compositionService', () => mockCompositionService);
jest.mock('../../utils/logger', () => jest.fn());

const request = require('supertest');
const server = require('../../server');

describe('Compositions API Endpoints', () => {
    const mockParentMaterial = {
        id: 1,
        name: 'Steel',
        base_power: 100,
        power_level: 100,
        qty: 50
    };

    const mockChildMaterial = {
        id: 2,
        name: 'Iron',
        base_power: 80,
        power_level: 80,
        qty: 30
    };

    const mockWeapon = {
        id: 1,
        name: 'Steel Sword',
        material_id: 1,
        status: 'active'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/composition/:parentId/composition', () => {
        test('TestCase 1 - Should create new composition', async () => {
            const compositionData = {
                material_id: mockChildMaterial.id,
                qty: 5
            };

            const testResponse = {
                newComposition: {
                    parent_id: mockParentMaterial.id,
                    ...compositionData
                },
                updatedWeapons: [mockWeapon]
            };

            testCreate.mockResolvedValue(testResponse);

            const response = await request(server)
                .post(`/api/composition/${mockParentMaterial.id}/composition`)
                .send(compositionData)
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body).toHaveProperty('newComposition');
            expect(response.body).toHaveProperty('updatedWeapons');
            expect(response.body.newComposition).toHaveProperty('qty', 5);
            expect(testCreate).toHaveBeenCalledWith(mockParentMaterial.id, compositionData);
        });

        test('TestCase 2 - Should validate quantity', async () => {
            const compositionData = {
                material_id: mockChildMaterial.id,
                qty: -1
            };

            const error = new Error('Invalid quantity');
            error.statusCode = 400;
            testCreate.mockRejectedValue(error);

            const response = await request(server)
                .post(`/api/composition/${mockParentMaterial.id}/composition`)
                .send(compositionData)
                .set('Accept', 'application/json')
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Invalid quantity');
        });

        test('TestCase 3 - Should prevent self-referential composition', async () => {
            const compositionData = {
                material_id: mockParentMaterial.id,
                qty: 5
            };

            const error = new Error('Self-referential composition not allowed');
            error.statusCode = 400;
            testCreate.mockRejectedValue(error);

            const response = await request(server)
                .post(`/api/composition/${mockParentMaterial.id}/composition`)
                .send(compositionData)
                .set('Accept', 'application/json')
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Self-referential composition not allowed');
        });
    });

    describe('PUT /api/composition/:parentId/composition/:materialId', () => {
        test('TestCase 4 - Should update composition quantity', async () => {
            const updateData = {
                qty: 10
            };

            const testResponse = {
                updatedComposition: {
                    parent_id: mockParentMaterial.id,
                    material_id: mockChildMaterial.id,
                    qty: 10
                },
                updatedWeapons: [mockWeapon]
            };

            testUpdate.mockResolvedValue(testResponse);

            const response = await request(server)
                .put(`/api/composition/${mockParentMaterial.id}/composition/${mockChildMaterial.id}`)
                .send(updateData)
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body).toHaveProperty('updatedComposition');
            expect(response.body.updatedComposition).toHaveProperty('qty', 10);
            expect(testUpdate).toHaveBeenCalledWith(mockParentMaterial.id, mockChildMaterial.id, updateData);
        });

        test('TestCase 5 - Should update affected weapons', async () => {
            const updateData = {
                qty: 10
            };

            const testResponse = {
                updatedComposition: {
                    parent_id: mockParentMaterial.id,
                    material_id: mockChildMaterial.id,
                    qty: 10
                },
                updatedWeapons: [mockWeapon]
            };

            testUpdate.mockResolvedValue(testResponse);

            const response = await request(server)
                .put(`/api/composition/${mockParentMaterial.id}/composition/${mockChildMaterial.id}`)
                .send(updateData)
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body).toHaveProperty('updatedWeapons');
            expect(Array.isArray(response.body.updatedWeapons)).toBeTruthy();
        });
    });

    describe('DELETE /api/composition/:parentId/composition/:materialId', () => {
        test('TestCase 6 - Should delete composition', async () => {
            const testResponse = {
                deletedComposition: {
                    parent_id: mockParentMaterial.id,
                    material_id: mockChildMaterial.id
                },
                updatedWeapons: [mockWeapon]
            };

            testRemove.mockResolvedValue(testResponse);

            const response = await request(server)
                .delete(`/api/composition/${mockParentMaterial.id}/composition/${mockChildMaterial.id}`)
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body).toHaveProperty('deletedComposition');
            expect(response.body).toHaveProperty('updatedWeapons');
        });

        test('TestCase 7 - Should handle non-existent composition', async () => {
            const error = new Error('Composition not found');
            error.statusCode = 404;
            testRemove.mockRejectedValue(error);

            const response = await request(server)
                .delete(`/api/composition/${mockParentMaterial.id}/composition/99999`)
                .set('Accept', 'application/json')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Composition not found');
        });

        test('TestCase 8 - Should update affected weapons after deletion', async () => {
            const testResponse = {
                deletedComposition: {
                    parent_id: mockParentMaterial.id,
                    material_id: mockChildMaterial.id
                },
                updatedWeapons: [mockWeapon]
            };

            testRemove.mockResolvedValue(testResponse);

            const response = await request(server)
                .delete(`/api/composition/${mockParentMaterial.id}/composition/${mockChildMaterial.id}`)
                .set('Accept', 'application/json')
                .expect(200);

            expect(response.body.updatedWeapons).toBeDefined();
            expect(Array.isArray(response.body.updatedWeapons)).toBeTruthy();
        });
    });
});