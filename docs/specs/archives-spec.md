# Archives Spec v1.0

## Objetivo

Módulo "A" de P.A.R.A. — almacenamiento frío de todo lo que dejó de ser activo.
Valor principal: limpiar la vista activa sin perder información.

## Regla central

- Archivar = 1 acción desde la entidad de origen (menú ⚙ o botón)
- Restaurar = 1 clic desde /archives (sin confirmación, acción reversible)
- Eliminar permanente = 2 pasos (ámbar), irreversible

## Schema

### `areas` — nueva columna
```sql
ALTER TABLE areas ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'archived'));
```

### `resources` — actualizar constraint
Añadir 'archived' como valor válido de status.

## Entidades archivables

| Entidad | Cómo se archiva | Trigger en UI |
|---------|----------------|---------------|
| Proyectos | `status = 'archived'` | Ya existe: menú ⚙ → "Archivar" en ProjectDetailPage |
| Áreas | `status = 'archived'` | Añadir al menú ⚙ en AreaDetailPage |
| Resources | `status = 'archived'` | Botón en ResourceItem junto a ✓ / × |

## Página `/archives`

Una sola página unificada con 3 secciones (no tabs, scroll vertical):

```
Archivos
  ▸ Proyectos (N)   [colapsable, abierto por defecto si hay items]
  ▸ Áreas (N)
  ▸ Resources (N)
```

### Por cada ítem:
- Título / descripción breve
- Fecha de creación
- Botón "Restaurar" (teal, 1 clic) → `status = 'active'`, desaparece del listado
- Botón "Eliminar" (ámbar, 2 pasos) → hard delete

### Empty state:
"No tienes nada archivado. Cuando completes proyectos o áreas, aparecerán aquí."

## Filtros activos en vistas principales

Después del cambio:
- `getAreas()` → solo `status = 'active'`
- `getAreasWithLastLog()` → solo `status = 'active'`
- `getResources()` sin filtro → excluye `status = 'archived'`
- `getProjects()` → ya filtra `status = 'active'` ✅

## Skills nuevos / modificados

| Skill | Cambio |
|-------|--------|
| `getAreas` | + filtro `status = 'active'` |
| `getAreasWithLastLog` | + filtro `status = 'active'` |
| `updateArea` | + campo `status` en patch type |
| `getArchivedItems` (nuevo) | retorna `{ projects, areas, resources }` archivados |

## Diseño

- Warm Minimalism estándar
- Sin tabla — CSS variables nativas
- Secciones con header colapsable: `<details>` nativo o state booleano
- Cada ítem: card compacta horizontal (título + fecha + acciones a la derecha)
- Sin edición dentro de archives
