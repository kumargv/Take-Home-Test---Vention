const Weapon = require("../models/weapon");

const WeaponService = () => {
  const getAll = async () => {
    const weapons = await Weapon.getAll();
    return { weapons };
  };

  const getMaxBuildQuantity = async id => {
    const weaponWithMaxBuildQty = await Weapon.getMaxBuildQuantity(id);
    return weaponWithMaxBuildQty;
  };

  return { getAll, getMaxBuildQuantity };
};

module.exports = WeaponService;
