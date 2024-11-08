# API Documentation

## Models

### Weapon

| Attribute   | Type              |
| ----------- | ----------------- |
| id          | number            |
| name        | string            |
| power_level | number            |
| status      | "new" \| "broken" |

### Material

| Attribute   | Type   |
| ----------- | ------ |
| id          | number |
| power_level | number |
| qty         | number |
| deleted_at  | Date   |

### Composition

| Attribute   | Type   |
| ----------- | ------ |
| parent_id   | number |
| material_id | number |
| qty         | number |

## Endpoints

### Weapons

| Verb | Endpoint                           | Payload | Response                                  | Description                                                  |
| ---- | ---------------------------------- | ------- | ----------------------------------------- | ------------------------------------------------------------ |
| GET  | `/api/weapon`                      | `null`  | `Weapon[]`                                | Fetches all the weapons from the database                    |
| GET  | `/api/weapon/:id/maxBuildQuantity` | `null`  | `{ weapon: Weapon, maxBuildQty: number }` | Calculates the maximum number of times a weapon can be built |

### Materials

| Verb   | Endpoint            | Payload                                | Response                                                     | Description                                                                                                                             |
| ------ | ------------------- | -------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/material`     | `null`                                 | `Material[]`                                                 | Fetches all the materials from the database                                                                                             |
| GET    | `/api/material/:id` | `null`                                 | `Material`                                                   | Fetches a specific material from the database                                                                                           |
| PUT    | `/api/material/:id` | `{ power_level: number, qty: number }` | `{ updatedMaterials: Material[], updatedWeapons: Weapon[] }` | Updates the power level and the quantity of a material, and recalculates the power level of the affected weapons                        |
| DELETE | `/api/material/:id` | `null`                                 | `{ deletedMaterials: Material[], brokenWeapons: Weapon[] }`  | Sets the `deleted_at` field of a specific material and all its parent materials. Also sets the status of the affected weapons as broken |

### Compositions

| Verb   | Endpoint                                          | Payload                                | Response                                                        | Description                                                           |
| ------ | ------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| POST   | `/api/material/:parentId/composition`             | `{ material_id: number, qty: number }` | `{ newComposition: Composition, updatedWeapons: Weapon[] }`     | Assigns a child material to the material with the specified parent id |
| PUT    | `/api/material/:parentId/composition/:materialId` | `{ material_id: number, qty: number }` | `{ updatedComposition: Composition, updatedWeapons: Weapon[] }` | Updates the composition with the specified parent id and material id  |
| DELETE | `/api/material/:parentId/composition/:materialId` | `null`                                 | `{ deletedComposition: Composition, updatedWeapons: Weapon[] }` | Deletes the composition with the specified parent id and material id  |

### Misc

| Verb | Endpoint | Payload | Response | Description                                               |
| ---- | -------- | ------- | -------- | --------------------------------------------------------- |
| GET  | `/`      | `null`  | `string` | Simply displays a string "Weapon Quest" on the screen |
