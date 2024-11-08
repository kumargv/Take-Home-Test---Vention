const db = require("../config/dbConfig");
const { notFoundError, unexpectedError } = require("../utils/errors");

const table = "compositions";

class Composition {
  constructor(payload) {
    this.parent_id = payload.parent_id;
    this.material_id = payload.material_id;
    this.qty = payload.qty;
  }

  static async get(parentId, materialId) {
    try {
      const composition = await db(table).where("parent_id", parentId).where("material_id", materialId).first();

      if (!composition) {
        return null;
      }

      return new Composition(composition);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Composition.get");
    }
  }

  static async create(parentId, payload) {
    try {
      const insertedCompositions = await db(table)
        .insert({
          parent_id: parentId,
          material_id: payload.material_id,
          qty: payload.qty
        })
        .returning("*");
      return new Composition(insertedCompositions[0]);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Composition.create");
    }
  }

  static async update(parentId, materialId, payload) {
    try {
      const updatedCompositions = await db(table)
        .update({
          material_id: payload.material_id,
          qty: payload.qty
        })
        .where("parent_id", parentId)
        .where("material_id", materialId)
        .returning("*");

      if (updatedCompositions.length === 0) {
        throw notFoundError(
          `Composition with the parent_id ${parentId} and the material_id ${materialId} does not exist`
        );
      }

      return new Composition(updatedCompositions[0]);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Composition.update");
    }
  }

  static async getParentCompositions(id) {
    try {
      const compositions = await db
        .withRecursive("parent_compositions_cte", qb => {
          qb.select("parent_id", "material_id")
            .from(table)
            .where("material_id", id)
            .union(qbu => {
              qbu
                .select("c.parent_id", "c.material_id")
                .from(`${table} as c`)
                .join("parent_compositions_cte as sm", "c.material_id", "sm.parent_id");
            });
        })
        .select("*")
        .from("parent_compositions_cte");

      return compositions.map(composition => new Composition(composition));
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Composition.getParentCompositions");
    }
  }

  static async catchCircularReference() {
    try {
      const compositions = await db
        .withRecursive("circular_reference_cte", qb => {
          qb.select("parent_id", "material_id")
            .from(table)
            .union(qbu => {
              qbu
                .select("c.parent_id", "cr.material_id")
                .from(`${table} as c`)
                .join("circular_reference_cte as cr", function () {
                  this.on("cr.parent_id", "=", "c.material_id")
                    .on("cr.parent_id", "<>", "cr.material_id")
                    .on("c.parent_id", "<>", "c.material_id");
                });
            });
        })
        .select("*")
        .from("circular_reference_cte as cr")
        .where("cr.parent_id", db.raw("cr.material_id"));

      return !!compositions.length;
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Composition.catchCircularReference");
    }
  }

  static async delete(parentId, materialId) {
    try {
      const deletedCompositions = await db(table)
        .where("parent_id", parentId)
        .where("material_id", materialId)
        .delete()
        .returning("*");

      if (!deletedCompositions.length) {
        throw notFoundError(
          `Composition with the parent_id ${parentId} and the material_id ${materialId} does not exist`
        );
      }

      return new Composition(deletedCompositions[0]);
    } catch (e) {
      throw unexpectedError(e, "Unexpected error in Composition.delete");
    }
  }
}

module.exports = Composition;
