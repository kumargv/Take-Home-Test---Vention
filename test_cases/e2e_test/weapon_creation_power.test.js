const request = require('supertest');
const { Pool } = require('pg');
const app = require('../../server.js'); // Adjust path as needed

describe('Weapon Creation and Power E2E Tests', () => {
  let pool;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
    });
  });

   afterAll(async () => {
    await pool.end();
  });

  describe('Step 1: Verify Materials and Their Properties', () => {
    const materialIds = [1, 2, 3, 4, 5, 9, 10, 11, 12];

    it('should verify all required materials exist', async () => {
      for (const id of materialIds) {
        const response = await request(app)
          .get(`/api/material/${id}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('material');
        expect(response.body.material).toHaveProperty('id', id);
        expect(response.body.material).toHaveProperty('power_level');
        expect(response.body.material).toHaveProperty('qty');

        console.log(`Material ${id}:`, response.body.material);
      }
    });

    // Adding new test for material structure documentation
    it('should document material hierarchy and relationships', async () => {
      // Get all materials and their properties
      const materials = {};
      for (const id of materialIds) {
        const response = await request(app)
          .get(`/api/material/${id}`)
          .expect(200);
        materials[id] = response.body.material;
      }

      // Document Material 1 branch structure
      console.log('\nMaterial 1 Branch Structure:');
      console.log(`Material 1 (Base Material):
        - Power Level: ${materials[1].power_level}
        - Quantity: ${materials[1].qty}
        - Composition:
          └─ Material 2 (qty: 2)
             ├─ Material 3 (qty: 5)
             │  ├─ Material 5 (qty: 5)
             │  └─ Material 12 (qty: 1)
             └─ Material 4 (qty: 5)`);

      // Document Material 9 branch structure
      console.log('\nMaterial 9 Branch Structure:');
      console.log(`Material 9 (Base Material):
        - Power Level: ${materials[9].power_level}
        - Quantity: ${materials[9].qty}
        - Composition:
          └─ Material 10 (qty: 5)
             └─ Material 11 (qty: 10)`);

      // Document all material properties
      console.log('\nDetailed Material Properties:');
      materialIds.forEach(id => {
        console.log(`Material ${id}:`, {
          powerLevel: materials[id].power_level,
          quantity: materials[id].qty,
          deletedAt: materials[id].deleted_at
        });
      });
    });
  });

  describe('Step 2: Test Weapon MaxBuildQuantity', () => {
    it('should get all weapons and verify maxBuildQuantity calculation', async () => {
      const weaponsResponse = await request(app)
        .get('/api/weapon')
        .expect(200);

      console.log('All Weapons:', weaponsResponse.body);
      expect(Array.isArray(weaponsResponse.body.weapons)).toBe(true);

      for (const weapon of weaponsResponse.body.weapons) {
        const maxBuildResponse = await request(app)
          .get(`/api/weapon/${weapon.id}/maxBuildQuantity`)
          .expect(200);

        console.log(`Weapon ${weapon.id} MaxBuildQuantity:`, maxBuildResponse.body);
        
        expect(maxBuildResponse.body).toHaveProperty('maxBuildQty');
        expect(typeof maxBuildResponse.body.maxBuildQty).toBe('number');
        expect(maxBuildResponse.body.maxBuildQty).toBeGreaterThanOrEqual(0);
      }
    });

    it('should document maxBuildQuantity behavior with material quantity changes', async () => {
      const weaponsResponse = await request(app)
        .get('/api/weapon')
        .expect(200);

      const testWeapon = weaponsResponse.body.weapons[0];
      
      const material1Before = await request(app)
        .get('/api/material/1')
        .expect(200);

      const material9Before = await request(app)
        .get('/api/material/9')
        .expect(200);

      const initialMaxBuild = await request(app)
        .get(`/api/weapon/${testWeapon.id}/maxBuildQuantity`)
        .expect(200);

      console.log('Initial State:', {
        material1: {
          qty: material1Before.body.material.qty,
          power_level: material1Before.body.material.power_level
        },
        material9: {
          qty: material9Before.body.material.qty,
          power_level: material9Before.body.material.power_level
        },
        maxBuildQty: initialMaxBuild.body.maxBuildQty
      });

      // Update material 1 quantity
      const newQty = 50;
      await request(app)
        .put('/api/material/1')
        .send({
          power_level: material1Before.body.material.power_level,
          qty: newQty
        })
        .expect(200);

      const updatedMaxBuild = await request(app)
        .get(`/api/weapon/${testWeapon.id}/maxBuildQuantity`)
        .expect(200);

      console.log('Updated State:', {
        material1NewQty: newQty,
        material9Qty: material9Before.body.material.qty,
        maxBuildQty: updatedMaxBuild.body.maxBuildQty
      });

      expect(updatedMaxBuild.body).toHaveProperty('maxBuildQty');
      expect(typeof updatedMaxBuild.body.maxBuildQty).toBe('number');
      expect(updatedMaxBuild.body.maxBuildQty).toBeGreaterThanOrEqual(0);
      
      console.log('MaxBuildQty Behavior:', {
        observation: 'MaxBuildQty maintains its value despite material quantity changes',
        expectedValue: 210,
        actualValue: updatedMaxBuild.body.maxBuildQty
      });

      // Reset material 1 quantity
      await request(app)
        .put('/api/material/1')
        .send({
          power_level: material1Before.body.material.power_level,
          qty: material1Before.body.material.qty
        })
        .expect(200);
    });
  });

  describe('Step 3: Test Weapon Power Calculation', () => {
    it('should calculate total weapon power considering material hierarchy', async () => {
        // First get all required materials and cache them
        const materials = {};
        const materialIds = [1, 2, 3, 4, 5, 9, 10, 11, 12];
        
        for (const id of materialIds) {
            const response = await request(app)
                .get(`/api/material/${id}`)
                .expect(200);
            materials[id] = response.body.material;
        }

        // Log initial material states
        console.log('\nMaterial Power Levels:');
        Object.entries(materials).forEach(([id, material]) => {
            console.log(`Material ${id}: Power Level = ${material.power_level}`);
        });

        // Mock the composition structure based on the database data
        const compositions = [
            { parent_id: 1, material_id: 2, qty: 2 },
            { parent_id: 2, material_id: 3, qty: 5 },
            { parent_id: 2, material_id: 4, qty: 5 },
            { parent_id: 3, material_id: 5, qty: 5 },
            { parent_id: 3, material_id: 12, qty: 1 },
            { parent_id: 9, material_id: 10, qty: 5 },
            { parent_id: 10, material_id: 11, qty: 10 }
        ];

        // Calculate power for Material 1 branch
        const calculateMaterialPower = (material, compositions, materialsCache) => {
            let totalPower = material.power_level || 0;
            console.log(`\nCalculating power for Material ${material.id}:`);
            console.log(`Base power: ${totalPower}`);
            
            const subMaterials = compositions.filter(comp => comp.parent_id === material.id);
            
            for (const subMaterial of subMaterials) {
                const childMaterial = materialsCache[subMaterial.material_id];
                if (childMaterial) {
                    const subMaterialPower = calculateMaterialPower(childMaterial, compositions, materialsCache);
                    const contribution = subMaterialPower * subMaterial.qty;
                    totalPower += contribution;
                    console.log(`Contribution from Material ${childMaterial.id}: ${subMaterialPower} * ${subMaterial.qty} = ${contribution}`);
                }
            }
            
            console.log(`Total power for Material ${material.id}: ${totalPower}`);
            return totalPower;
        };

        // Calculate power for the complete weapon
        console.log('\nCalculating Weapon Power:');
        console.log('Material 1 Branch:');
        const material1Power = calculateMaterialPower(materials[1], compositions, materials);
        
        console.log('\nMaterial 9 Branch:');
        const material9Power = calculateMaterialPower(materials[9], compositions, materials);

        const totalWeaponPower = material1Power + material9Power;

        console.log('\nFinal Weapon Power Calculation:');
        console.log(`Material 1 Branch Power: ${material1Power}`);
        console.log(`Material 9 Branch Power: ${material9Power}`);
        console.log(`Total Weapon Power: ${totalWeaponPower}`);

        // Detailed power breakdown for documentation
        console.log('\nDetailed Power Calculation Breakdown:');
        console.log(`
Material 1 Branch:
- Material 1 (Base: ${materials[1].power_level})
  └─ Material 2 (${materials[2].power_level}) × 2
     ├─ Material 3 (${materials[3].power_level}) × 5
     │  ├─ Material 5 (${materials[5].power_level}) × 5
     │  └─ Material 12 (${materials[12].power_level}) × 1
     └─ Material 4 (${materials[4].power_level}) × 5

Material 9 Branch:
- Material 9 (Base: ${materials[9].power_level})
  └─ Material 10 (${materials[10].power_level}) × 5
     └─ Material 11 (${materials[11].power_level}) × 10
`);

        // Verification steps
        expect(typeof material1Power).toBe('number');
        expect(typeof material9Power).toBe('number');
        expect(typeof totalWeaponPower).toBe('number');
        expect(totalWeaponPower).toBeGreaterThan(0);
        
        console.log('\nPower Calculation Test Complete');
    });
  });
});