exports.seed = async function (knex) {
  await knex("weapons_materials").del();
  await knex("weapons").del();
  return await Promise.all([
    await knex("weapons").insert([
      { id: 1, name: "Excalibur", power_level: 0, status: "new" },
      { id: 2, name: "Magic Staff", power_level: 0, status: "new" },
      { id: 3, name: "Axe", power_level: 0, status: "new" }
    ]),
    await knex("weapons_materials").insert([
      { id: 1, weapon_id: 1, material_id: 1 },
      { id: 2, weapon_id: 1, material_id: 6 },
      { id: 3, weapon_id: 1, material_id: 9 },
      { id: 4, weapon_id: 1, material_id: 12 },
      { id: 5, weapon_id: 2, material_id: 6 },
      { id: 6, weapon_id: 3, material_id: 9 },
      { id: 7, weapon_id: 3, material_id: 12 }
    ])
  ]);
};
