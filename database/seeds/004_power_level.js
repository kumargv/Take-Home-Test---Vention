const Weapon = require("../../models/weapon");

exports.seed = async function () {
  return await Promise.all([
    Weapon.getPowerLevel(1).then(power_level => Weapon.update(1, { power_level })),
    Weapon.getPowerLevel(2).then(power_level => Weapon.update(2, { power_level })),
    Weapon.getPowerLevel(3).then(power_level => Weapon.update(3, { power_level }))
  ]);
};
