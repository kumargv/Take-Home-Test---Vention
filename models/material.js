const db = require("../config/dbConfig");
const { notFoundError, unexpectedError } = require("../utils/errors");
const table = "materials";

class Material {
  constructor(payload) {
    this.id = payload.id;
    this.power_level = payload.power_level;
    this.qty = payload.qty;
    this.deleted_at = payload.deleted_at;
  }

  static async getAll() {
    try {
      const materials = await db(table);
      return materials.map(material => new Material(material));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Material.getAll");
    }
  }

  static async get(id) {
    try {
      const material = await db(table).where("id", id).first();

      if (!material) {
        throw notFoundError(`Material with ID ${id} does not exist`);
      }

      return new Material(material);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Material.get");
    }
  }

  static async update(id, params) {
    try {
      const materials = await db(table).returning("*").where("id", id).update(params);

      if (materials.length === 0) {
        throw notFoundError(`Material with ID ${id} does not exist`);
      }

      return new Material(materials[0]);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Material.update");
    }
  }

  static async deleteMany(ids) {
    try {
      const materials = await db(table).returning("*").whereIn("id", ids).update({ deleted_at: new Date() });
      return materials.map(material => new Material(material));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Material.deleteMany");
    }
  }
}

module.exports = Material;
