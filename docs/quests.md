# Quests

## Quest 1: Weapon model and entity

### Relevant files

- create_weapons_table.js
- 003_weapons.js
- weapon.js

## Quest 2: Implement method to calculate power level of a weapon

### Relevant files

- create_weapons_table.js
- 004_power_level.js
- weapon.js
- tree.js

### Description

The power level of the weapons are calculated during the seeding process.

To calculate the power level of a weapon:

1. Fetch the materials that weapons

2. For each material

   a. Recursively fetch the compositions of the material

   b. Initialize and populate an N-ary Tree with the material and its compositions

   c. Recursively calculate the power level with the provided equation

3. Return the sum of all the recursive calculations

## Quest 3: Recalculate power level of affected weapons after an update on a material

### Relevant files

- weapon.js

### Description

Whenever the user updates a material or a composition, we must identify all the weapons that are affected by the change and update its power level.

To update the power level of affected weapons:

1. Fetch the affected weapons by checking if the weapon contains the updated material od its parent materials

2. For each weapon

   a. [Calculate the power level](#quest-2-implement-method-to-calculate-power-level-of-a-weapon)

   b. Update the weapon with the result

## Quests 4: CRUD for the material class

### CREATE

- Out of scope

### READ

- Already implemented

### UPDATE

- [Docs](crud-update.md)

### DELETE

- [Docs](crud-delete.md)

## Quest 5: API endpoint to fetch the max number of builds for a weapon

### Relevant files

- weapon.js
- weaponService.js
- weaponsRouter.js
- tree.js

### Description

The user can call the `/api/weapon/:id/maxBuildQuantity` to get the maximum builds of the specified weapon

To calculate the maximum builds of a weapon:

1. Fetch the materials that weapons

2. For each material

   a. Recursively fetch the compositions of the material

   b. Initialize and populate an N-ary Tree with the material and its compositions

   c. Recursively calculate the maximum build quantity with the provided equation

3. Return the minimum value of all the results
