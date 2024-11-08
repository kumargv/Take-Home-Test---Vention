/**
 * Recursive function to calculate material power
 * @param {Object} material - The material object
 * @param {Array} compositions - Array of compositions from the database
 * @param {Object} materialsCache - Cache of all materials
 * @returns {number} - Total power of the material including sub-materials
 */
const calculateMaterialPower = (material, compositions, materialsCache) => {
    // Base power of the material itself
    let totalPower = material.power_level || 0;
    
    // Find all direct sub-materials of this material
    const subMaterials = compositions.filter(comp => comp.parent_id === material.id);
    
    // For each sub-material, recursively calculate its power contribution
    for (const subMaterial of subMaterials) {
        const childMaterial = materialsCache[subMaterial.material_id];
        if (childMaterial) {
            // Recursive call to get sub-material's power
            const subMaterialPower = calculateMaterialPower(childMaterial, compositions, materialsCache);
            // Add sub-material's contribution (power * quantity)
            totalPower += subMaterialPower * subMaterial.qty;
        }
    }
    
    return totalPower;
};

/**
 * Calculate total weapon power based on its materials
 * @param {Array} weaponMaterials - Materials used in the weapon
 * @param {Array} compositions - All material compositions
 * @param {Object} materialsCache - Cache of all materials
 * @returns {number} - Total weapon power
 */
const calculateWeaponPower = (weaponMaterials, compositions, materialsCache) => {
    let totalWeaponPower = 0;
    
    for (const material of weaponMaterials) {
        const materialPower = calculateMaterialPower(material, compositions, materialsCache);
        totalWeaponPower += materialPower;
    }
    
    return totalWeaponPower;
};