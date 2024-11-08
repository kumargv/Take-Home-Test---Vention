const db = require("../config/dbConfig");
const Tree = require("../utils/tree");
const { notFoundError, unexpectedError } = require("../utils/errors");

const table = "weapons";

class Weapon {
  constructor(payload) {
    this.id = payload.id;
    this.name = payload.name;
    this.power_level = payload.power_level;
    this.status = payload.status;
  }

  static async getAll() {
    try {
      const weapons = await db(table);
      return weapons.map(weapon => new Weapon(weapon));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.getAll");
    }
  }

  static async getByMaterialId(materialId) {
    try {
      const weapons = await db(`${table} as w`)
        .select("w.id", "w.name", "w.power_level", "w.status")
        .join("weapons_materials as wm", "w.id", "wm.weapon_id")
        .where("material_id", materialId)
        .distinct();

      return weapons.map(weapon => new Weapon(weapon));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.getByMaterialId");
    }
  }

  static async getByMaterialIds(materialIds) {
    try {
      const weapons = await db(`${table} as w`)
        .select("w.id", "w.name", "w.power_level", "w.status")
        .join("weapons_materials as wm", "w.id", "wm.weapon_id")
        .whereIn("material_id", materialIds)
        .distinct();

      return weapons.map(weapon => new Weapon(weapon));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.getByMaterialIds");
    }
  }

  static async getPowerLevel(id) {
    try {
      const weapon = db(table).where("id", id).first();

      if (!weapon) {
        throw notFoundError(`Weapon with ID ${id} does not exist`);
      }

      const baseMaterials = await this.#getBaseMaterialsByWeaponId(id);

      let powerLevel = 0;

      for (const material of baseMaterials) {
        const subMaterials = await this.#getSubMaterials(material.material_id);

        const tree = new Tree(material.material_id, { power_level: material.power_level, c_qty: 1 });
        tree.populate(subMaterials);
        powerLevel += tree.calculateTotalPower(0, tree.root);
      }

      return powerLevel;
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.getPowerLevel");
    }
  }

  static async recalculatePowerLevels(ids) {
    try {
      const affectedWeapons = await this.getByMaterialIds(ids);

      const updatedWeapons = [];
      for (const weapon of affectedWeapons) {
        const newPowerLevel = await this.getPowerLevel(weapon.id);
        const updatedWeapon = await this.update(weapon.id, { power_level: newPowerLevel });
        updatedWeapons.push(updatedWeapon);
      }

      return updatedWeapons.map(weapon => new Weapon(weapon));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.recalculatePowerLevels");
    }
  }

  static async getMaxBuildQuantity(id) {
    try {
      const weapon = await db(table).where("id", id).first();

      if (!weapon) {
        throw notFoundError(`Weapon with ID ${id} does not exist`);
      }

      const baseMaterials = await this.#getBaseMaterialsByWeaponId(id);

      let minQty = Number.MAX_SAFE_INTEGER;

      for (const material of baseMaterials) {
        const subMaterials = await this.#getSubMaterials(material.material_id);

        if (subMaterials.length === 0) {
          minQty = Math.min(minQty, material.qty);
          break;
        }

        const tree = new Tree(material.material_id, { c_qty: material.c_qty, qty: material.qty });
        tree.populate(subMaterials);
        const maxQuantity = Math.floor(tree.getMaxQuantity(0, tree.root));
        minQty = Math.min(minQty, maxQuantity);
      }

      return { weapon: new Weapon(weapon), maxBuildQty: minQty };
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.getMaxBuildQuantity");
    }
  }

  static async update(id, params) {
    try {
      const weapon = db(table).where("id", id).first();

      if (!weapon) {
        throw notFoundError(`Weapon with ID ${id} does not exist`);
      }

      const weapons = await db(table).returning("*").update(params).where("id", id);
      return new Weapon(weapons[0]);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.update");
    }
  }

  static async breakMany(ids) {
    try {
      const updatedWeapons = await db(table).returning("*").update("status", "broken").whereIn("id", ids);
      return updatedWeapons.map(weapon => new Weapon(weapon));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.breakMany");
    }
  }

  static async #getBaseMaterialsByWeaponId(id) {
    try {
      return await db("materials as m")
        .select("m.id as material_id", "m.power_level", "m.qty")
        .join("weapons_materials as wm", "m.id", "wm.material_id")
        .join("weapons as w", "w.id", "wm.weapon_id")
        .where("w.id", id);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.getBaseMaterialsByWeaponId");
    }
  }

  static async #getSubMaterials(id) {
    try {
      return await db
        .withRecursive("sub_materials_cte", qb => {
          qb.select("c.parent_id", "c.material_id", "m.power_level", "m.qty as qty", "c.qty as c_qty")
            .from("compositions as c")
            .join("materials as m", "m.id", "c.material_id")
            .where("c.parent_id", id)
            .union(qbu => {
              qbu
                .select("c.parent_id", "c.material_id", "m.power_level", "m.qty as qty", "c.qty as c_qty")
                .from("compositions as c")
                .join("sub_materials_cte as sm", "c.parent_id", "sm.material_id")
                .join("materials as m", "m.id", "c.material_id");
            });
        })
        .select("*")
        .from("sub_materials_cte");
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Weapon.getSubMaterials");
    }
  }
}

module.exports = Weapon;
