# Material CRUD - UPDATE

Updating a material includes the actions of:

- Updating the power level and the quantity of the material

- Assigning a new child node by adding a composition

- Updating a child node by either changing the material_id of a composition or simply updating the composition's quantity

- Removing a child node by deleting a composition

## Update the material attributes

### Relevant files

- weapon.js
- material.js
- materialService.js
- materialsRouter.js

### Description

Updates the power level and the quantity of the material, then updates the power level of the affected weapons. Here, we check to see if the new power level and the quantity are positive values.

To update a material:

1. Update the specified material with the payload values

2. Fetch the parent compositions of the updated material

3. [Recalculate the power levels of the affected weapons](quests.md#quest-3-recalculate-power-level-of-affected-weapons-after-an-update-on-a-material)

## Create a new composition

### Relevant files

- weapon.js
- composition.js
- compositionService.js
- compositionsRouter.js

### Description

Creates a new composition by assigning a child node to the specified material, then updates the power level of the affected weapons. Here, we check to see if the new quantity is a positive value. We also check to make sure that the user is not setting the new composition to itself. Finally we check if the new composition causes a circular reference between materials.

To create a new composition:

1. Create a new composition with payload values

2. If there is a circular reference, rollback and throw and error

3. Else, fetch the parent compositions of the updated material

4. [Recalculate the power levels of the affected weapons](quests.md#quest-3-recalculate-power-level-of-affected-weapons-after-an-update-on-a-material)

## Update a composition

### Relevant files

- weapon.js
- composition.js
- compositionService.js
- compositionsRouter.js

### Description

Updates the specified composition by either reassigning it to the specified material id or simply updating the quantity of the composition. Then it updates the power level of the affected weapons. Here, we check to see if the new quantity is a positive value. We also check to make sure that the user is not setting the new composition to itself. Finally we check if the new composition causes a circular reference between materials.

To update a composition:

1. update a new composition with payload values

2. If there is a circular reference, rollback and throw and error

3. Else, fetch the parent compositions of the updated material

4. [Recalculate the power levels of the affected weapons](quests.md#quest-3-recalculate-power-level-of-affected-weapons-after-an-update-on-a-material)

## Delete a composition

### Relevant files

- weapon.js
- composition.js
- compositionService.js
- compositionsRouter.js

### Description

Deletes the specified composition, then it updates the power level of the affected weapons.

To delete a composition:

1. Delete the composition

2. Fetch the parent compositions of the updated material

3. [Recalculate the power levels of the affected weapons](quests.md#quest-3-recalculate-power-level-of-affected-weapons-after-an-update-on-a-material)
