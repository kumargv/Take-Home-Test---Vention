const Composition = require("../models/composition");
const Material = require("../models/material");
const Weapon = require("../models/weapon");
const { badRequestError } = require("../utils/errors");

const MaterialService = () => {
  const getAll = async () => {
    const materials = await Material.getAll();
    return { materials };
  };

  const get = async id => {
    const material = await Material.get(id);
    return { material };
  };

  const update = async (id, params) => {
    if (params.power_level < 0 || params.qty < 0) {
      throw badRequestError("Power level and quantity must be positive");
    }

    const material = await Material.get(id);
    const updatedMaterial = await Material.update(material.id, params);
    const parentCompositions = await Composition.getParentCompositions(updatedMaterial.id);

    const parentIds = parentCompositions.map(composition => composition.parent_id);
    const updatedWeapons = await Weapon.recalculatePowerLevels([updatedMaterial.id, ...parentIds]);

    return { updatedMaterial, updatedWeapons };
  };

  const remove = async id => {
    const material = await Material.get(id);
    const parentCompositions = await Composition.getParentCompositions(material.id);

    const parentIds = parentCompositions.map(composition => composition.parent_id);
    const deletedMaterials = await Material.deleteMany([material.id, ...parentIds]);

    const deletedMaterialIds = deletedMaterials.map(material => material.id);
    const weaponsToBreak = await Weapon.getByMaterialIds(deletedMaterialIds);

    const weaponIds = weaponsToBreak.map(weapon => weapon.id);
    const brokenWeapons = await Weapon.breakMany(weaponIds);

    return { deletedMaterials, brokenWeapons };
  };

  return { getAll, get, update, remove };
};

module.exports = MaterialService;
