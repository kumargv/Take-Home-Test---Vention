const router = require("express").Router();
const WeaponService = require("../services/weaponService");
const WeaponPowerCalculation = require("../services/powerCalculationService");
const logError = require("../utils/logger");

router.get("/", async (_, res) => {
  try {
    const response = await WeaponService().getAll();
    res.status(200).json(response);
  } catch (err) {
    logError("GET Weapon", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

router.get("/:id/maxBuildQuantity", async (req, res) => {
  try {
    const response = await WeaponService().getMaxBuildQuantity(
      parseInt(req.params.id)
    );
    res.status(200).json(response);
  } catch (err) {
    logError("GET MaxBuildQuantity", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

// Add new power endpoint
router.get('/api/weapon/:id/power', async (req, res) => {
    try {
        // Get weapon materials
        const weaponMaterials = await db.query(
            'SELECT m.* FROM materials m ' +
            'JOIN weapons_materials wm ON m.id = wm.material_id ' +
            'WHERE wm.weapon_id = $1',
            [req.params.id]
        );

        // Get all compositions
        const compositions = await db.query(
            'SELECT * FROM compositions'
        );

        // Create materials cache
        const materialsCache = {};
        const allMaterials = await db.query('SELECT * FROM materials');
        for (const material of allMaterials.rows) {
            materialsCache[material.id] = material;
        }

        // Calculate power
        const power = calculateWeaponPower(
            weaponMaterials.rows,
            compositions.rows,
            materialsCache
        );

        res.json({ power });
    } catch (error) {
        console.error('Error calculating weapon power:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
