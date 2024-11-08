# Database Documentation

## Schema

### Weapons Table

| Attribute   | Type    | Constraints |
| ----------- | ------- | ----------- |
| id          | int     | PK          |
| name        | varchar |             |
| power_level | int     |             |
| status      | varchar |             |

### Materials Table

| Attribute   | Type | Constraints |
| ----------- | ---- | ----------- |
| id          | int  | PK          |
| power_level | int  |             |
| qty         | int  |             |
| deleted_at  | Date |             |

### Compositions Table

| Attribute   | Type |
| ----------- | ---- |
| parent_id   | int  |
| material_id | int  |
| qty         | int  |

### MaterialsWeapons Lookup Table

| Attribute   | Type   | Constraints                               |
| ----------- | ------ | ----------------------------------------- |
| weapon_id   | number | FK to the id field of the weapons table   |
| material_id | number | FK to the id field of the materials table |

## Seeding process

1.  Adds the materials and compositions
2.  Adds the weapons and assigns the appropriate materials to the weapons
3.  Calculates the power level of each weapon
