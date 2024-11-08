exports.up = async function (knex) {
  await knex.schema.createTable("weapons", function (t) {
    t.increments("id").unsigned().primary();
    t.string("name").notNullable();
    t.integer("power_level").notNullable();
    t.string("status"); //.checkIn(["new", "broken"]); not working??
  });

  await knex.schema.createTable("weapons_materials", function (t) {
    t.increments("id").unsigned().primary();
    t.integer("weapon_id").unsigned().notNullable().references("id").inTable("weapons");
    t.integer("material_id").unsigned().notNullable().references("id").inTable("materials");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("weapons_materials");
  await knex.schema.dropTable("weapons");
};
