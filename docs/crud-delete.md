# Material CRUD - DELETE

## Relevant files

- weapon.js
- material.js
- materialService.js
- materialsRouter.js

## Description

When the user pokes this endpoint, we do a soft delete of the specified material. We also fetch the parent materials and soft delete them as well. Finally, we fetch the affected weapons (weapons that contain the deleted materials) and mark them as broken

To delete the materials:

1. Fetch the parents of the specified material

2. Update the deleted_at attribute of the materials

3. Fetch the weapons that contain the deleted materials

4. Update the status of the weapons as broken
