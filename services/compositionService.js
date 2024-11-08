const Composition = require("../models/composition");
const Weapon = require("../models/weapon");
const { badRequestError } = require("../utils/errors");

const CompositionService = () => {
  const create = async (parentId, payload) => {
    if (payload.material_id === parentId) {
      throw badRequestError(
        "Cannot set the composition of a material to itself"
      );
    }

    if (payload.qty < 0) {
      throw badRequestError("the quantity must be a positive value");
    }

    const existingComposition = await Composition.get(
      parentId,
      payload.material_id
    );

    if (existingComposition) {
      throw badRequestError(
        `The composition with the parent_id ${parentId} and the material_id ${payload.material_id} already exists`
      );
    }

    const newComposition = await Composition.create(parentId, payload);

    const hasCircularReference = await Composition.catchCircularReference();

    if (hasCircularReference) {
      await Composition.delete(parentId, payload.material_id);
      throw badRequestError(
        `The composition with the parent_id ${parentId} and the material_id ${payload.material_id} would cause a circular reference`
      );
    }

    const parentCompositions = await Composition.getParentCompositions(
      parentId
    );
    const parentIds = parentCompositions.map(
      (composition) => composition.parent_id
    );
    const updatedWeapons = await Weapon.recalculatePowerLevels([
      newComposition.parent_id,
      ...parentIds,
    ]);

    return { newComposition, updatedWeapons };
  };

  const update = async (parentId, materialId, payload) => {
    if (payload.material_id === parentId) {
      throw badRequestError(
        "Cannot set the composition of a material to itself"
      );
    }

    if (payload.qty < 0) {
      throw badRequestError("the quantity must be a positive value");
    }

    const existingComposition = await Composition.get(
      parentId,
      payload.material_id
    );

    if (existingComposition) {
      throw badRequestError(
        `The composition with the parent_id ${parentId} and the material_id ${payload.material_id} already exists`
      );
    }

    const updatedComposition = await Composition.update(
      parentId,
      materialId,
      payload
    );

    const hasCircularReference = await Composition.catchCircularReference();

    if (hasCircularReference) {
      await Composition.update(parentId, payload.material_id, {
        material_id: existingComposition.material_id,
        qty: existingComposition.qty,
      });
      throw badRequestError(
        `The composition with the parent_id ${parentId} and the material_id ${payload.material_id} would cause a circular reference`
      );
    }

    const parentCompositions = await Composition.getParentCompositions(
      updatedComposition.parent_id
    );
    const parentIds = parentCompositions.map(
      (composition) => composition.parent_id
    );
    const updatedWeapons = await Weapon.recalculatePowerLevels([
      updatedComposition.parent_id,
      ...parentIds,
    ]);

    return { updatedComposition, updatedWeapons };
  };

  const remove = async (parentId, materialId) => {
    const deletedComposition = await Composition.delete(parentId, materialId);
    const parentCompositions = await Composition.getParentCompositions(
      deletedComposition.parent_id
    );

    const parentIds = parentCompositions.map(
      (composition) => composition.parent_id
    );
    const updatedWeapons = await Weapon.recalculatePowerLevels([
      deletedComposition.parent_id,
      ...parentIds,
    ]);

    return { deletedComposition, updatedWeapons };
  };

  return { create, update, remove };
};

module.exports = CompositionService;
