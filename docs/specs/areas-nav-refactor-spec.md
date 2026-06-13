# Áreas + Refactor de Navegación — Spec v1.0

**Estado:** Aprobado · 2026-06-13  
**Módulo anterior:** [dashboard-spec.md](dashboard-spec.md) ✅

---

## Contexto

El Dashboard actual usa `ParaTabs` para alternar entre categorías P.A.R.A. — solo ves una categoría a la vez. Para TDAH, lo invisible no existe: si tienes que cambiar de tab para ver tus Áreas, no las ves. Este spec resuelve dos cosas en un solo paso:

1. **Refactor de nav**: Dashboard pasa a ser un centro de mando real (highlights de todo). Proyectos y Áreas pasan a ser destinos propios en el NavBar.
2. **Módulo Áreas**: Dar vida a las Áreas de Responsabilidad de P.A.R.A. con un log de avances sin culpa, sin racha, sin objetivo numérico.

---

## Cambios de Arquitectura

### NavBar — nuevo (4 destinos)

```
Inbox ★  |  Dashboard  |  Proyectos  |  Áreas
```

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/inbox` | `InboxPage` | Sin cambios |
| `/dashboard` | `DashboardPage` | Refactorizado: centro de mando |
| `/projects` | `ProjectsPage` | Extraído de DashboardPage |
| `/projects/:id` | `ProjectDetailPage` | Sin cambios |
| `/areas` | `AreasPage` | Nuevo |
| `/areas/:id` | `AreaDetailPage` | Nuevo |

### Componentes deprecados

| Componente | Acción |
|-----------|--------|
| `ParaTabs` | Eliminar — ya no se usa en ninguna página |

---

## Página: Dashboard (Centro de Mando Refactorizado)

**Ruta:** `/dashboard`

El Dashboard deja de ser un gestor de proyectos y pasa a ser una vista de estado global. No hay tabs, no hay listas completas — solo los highlights que importan ahora.

### Layout

```
┌─────────────────────────────────────────┐
│  [Banner Inbox — solo si hay items]     │
├─────────────────────────────────────────┤
│  HOY                                    │
│  · [Proyecto A]  Llamar al banco        │
│  · [Proyecto B]  Revisar mockup         │
├─────────────────────────────────────────┤
│  PROYECTOS ACTIVOS          Ver todos → │
│  App TDAH        ████░░  4/7            │
│  Rediseño sitio  ██░░░░  1/5            │
├─────────────────────────────────────────┤
│  ÁREAS                      Ver áreas → │
│  · Alimentación   hace 4 días  Registrar│
│  · Finanzas       Sin avances  Registrar│
└─────────────────────────────────────────┘
```

### Reglas de la sección "Proyectos activos"

- Muestra máximo 3 proyectos con `status = 'active'`, orden por `updated_at DESC`
- Cada fila: título + barra de progreso + contador `done/total`
- Click en la fila navega a `/projects/:id`
- "Ver todos →" navega a `/projects`
- Si no hay proyectos activos: no se muestra la sección

### Reglas de la sección "Áreas"

- Muestra todas las áreas (sin límite — se espera un número pequeño)
- Cada fila: dot de color + nombre + "hace X días" o "Sin avances aún" + botón "Registrar"
- "Ver áreas →" navega a `/areas`
- "Registrar" abre el `AreaLogModal` inline
- Si no hay áreas creadas: no se muestra la sección

### Lo que NO cambia

- Banner Inbox condicional (sin número)
- Sección "Hoy" con tareas `due_date = TODAY`

---

## Página: Proyectos

**Ruta:** `/projects`

Extrae el contenido actual de `DashboardPage` (la grilla de proyectos) a su propia página. Sin ParaTabs, sin overhead.

### Layout

```
Proyectos

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Proyecto │ │ Proyecto │ │    +     │
│ 4/7 ████ │ │ 1/5 ██   │ │  Nuevo  │
└──────────┘ └──────────┘ └──────────┘
```

- Reutiliza `ProjectCard` y `ProjectForm` existentes sin cambios
- Muestra solo proyectos `status = 'active'` con `para_type = 'project'`
- Botón "+ Nuevo proyecto" (tarjeta dashed, igual que hoy en DashboardPage)

---

## Módulo: Áreas

### Concepto

Un Área es una responsabilidad continua sin fecha de fin (salud, finanzas, hogar). A diferencia de un Proyecto, no "se termina" — se sostiene en el tiempo.

El módulo no mide frecuencia, no muestra rachas, no genera culpa por ausencia. Solo registra presencia: cualquier avance es una victoria, sin importar cuándo fue el anterior.

### Entidad: Area

**Schema SQL — tabla `areas`**

```sql
CREATE TABLE areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#6b6375',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all" ON areas FOR ALL USING (true) WITH CHECK (true);
```

**Colores disponibles (paleta fija, sin emoji):**

```ts
export const AREA_COLORS = [
  '#10b981', // verde
  '#3b82f6', // azul
  '#f59e0b', // ámbar
  '#ef4444', // rojo
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#14b8a6', // teal
  '#f97316', // naranja
]
```

**TypeScript — `src/types/areas.ts`**

```ts
export interface Area {
  id: string
  title: string
  description: string | null
  color: string
  created_at: string
}

export type NewArea = Pick<Area, 'title' | 'description' | 'color'>

export interface AreaWithLastLog extends Area {
  last_logged_at: string | null  // fecha del log más reciente
}
```

### Entidad: AreaLog

**Schema SQL — tabla `area_logs`**

```sql
CREATE TABLE area_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id     UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE area_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all" ON area_logs FOR ALL USING (true) WITH CHECK (true);
```

`logged_at` es retroactivo: el usuario puede registrar algo que ocurrió ayer o hace tres días.

**TypeScript — `src/types/areas.ts` (continuación)**

```ts
export interface AreaLog {
  id: string
  area_id: string
  content: string
  logged_at: string   // ISO date 'YYYY-MM-DD'
  created_at: string
}

export type NewAreaLog = Pick<AreaLog, 'content' | 'logged_at'>
```

### Seed Data (opcional, aplicar con migración separada)

```sql
INSERT INTO areas (title, description, color) VALUES
  ('Alimentación', 'Comidas, nutrición y hábitos de cocina', '#10b981'),
  ('Finanzas',     'Presupuesto mensual y ahorro',           '#3b82f6');
```

---

## Skills Nuevos

| Archivo | Función | Operación |
|--------|---------|-----------|
| `getAreas.ts` | `getAreas()` → `Area[]` | SELECT todas, orden `created_at ASC` |
| `getAreasWithLastLog.ts` | `getAreasWithLastLog()` → `AreaWithLastLog[]` | SELECT areas + LEFT JOIN area_logs para obtener max(logged_at) |
| `createArea.ts` | `createArea(input: NewArea)` → `Area` | INSERT |
| `updateArea.ts` | `updateArea(id, patch)` → `Area` | UPDATE |
| `deleteArea.ts` | `deleteArea(id)` → `void` | DELETE (cascada elimina logs) |
| `getAreaLogs.ts` | `getAreaLogs(areaId)` → `AreaLog[]` | SELECT por area_id, orden `logged_at DESC` |
| `createAreaLog.ts` | `createAreaLog(areaId, input: NewAreaLog)` → `AreaLog` | INSERT |

### Implementación de `getAreasWithLastLog`

```ts
// Usa una sola query con agregación para no hacer N+1
const { data } = await supabase
  .from('areas')
  .select(`
    *,
    area_logs(logged_at)
  `)
  .order('created_at', { ascending: true })
```

Luego en el cliente: `Math.max(...logs.map(l => l.logged_at))` para obtener el último.

---

## Componentes Nuevos

| Componente | Descripción |
|-----------|-------------|
| `AreaCard` | Tarjeta con acento de color izquierdo, título, descripción, "hace X días" / "Sin avances aún", botón "Registrar avance" |
| `AreaForm` | Modal/inline form para crear/editar área: title, description, color picker (dots, sin emoji) |
| `AreaLogModal` | Modal de captura de avance: textarea + selector de fecha (Hoy / Ayer / Otra fecha) |
| `AreaLogItem` | Fila de log en la vista de detalle: fecha relativa + contenido |
| `ProjectsPage` | Extracción de la grilla de proyectos de DashboardPage (reutiliza componentes existentes) |
| `AreasPage` | Grid de AreaCards + tarjeta dashed "+ Nueva área" |
| `AreaDetailPage` | Header del área + lista cronológica de logs |

### AreaCard — detalle visual

```
┌───────────────────────────────────┐
▌ Alimentación                      │  ← barra izquierda 3px (color del área)
▌ Comidas, nutrición y hábitos      │  ← border-radius: 0 12px 12px 0
▌                                   │
▌ hace 4 días       [Registrar avance]│
└───────────────────────────────────┘
```

- Sin barra de progreso (no hay meta)
- "hace X días" calculado en el cliente desde `last_logged_at`
- Si `last_logged_at` es null: "Sin avances aún" (nunca en rojo)

### AreaLogModal — campos

1. `<textarea>` — ¿Qué hiciste? (texto libre, obligatorio)
2. Selector de fecha — tres opciones como chips: **Hoy** (default) | **Ayer** | **Otra fecha** (muestra date input)

---

## Páginas: Áreas

### AreasPage `/areas`

```
Áreas

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
▌ Alimentación     │  ▌ Finanzas         │  │      +           │
▌ hace 4 días      │  ▌ Sin avances aún  │  │  Nueva área      │
▌  [Registrar]     │  ▌  [Registrar]     │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### AreaDetailPage `/areas/:id`

```
← Áreas
Alimentación                              [Editar]
Comidas, nutrición y hábitos de cocina

                              [+ Registrar avance]

──────────────────────────────────────────
  13 jun   Preparé comidas para la semana
──────────────────────────────────────────
  9 jun    Fui al mercado, compré frutas
──────────────────────────────────────────
```

- Logs en orden cronológico inverso (más reciente arriba)
- Si no hay logs: mensaje neutro "Aún no hay avances registrados. ¡Empieza cuando quieras!"
- "← Áreas" navega a `/areas`

---

## Orden de Implementación

Siguiendo la regla **Schema antes de Frontend / Inner loops antes de UI**:

1. **Migración BD** — tablas `areas` + `area_logs` + seed data opcional
2. **Types** — `src/types/areas.ts`
3. **Skills** — en orden: `getAreas`, `getAreasWithLastLog`, `createArea`, `updateArea`, `deleteArea`, `getAreaLogs`, `createAreaLog`
4. **Refactor Nav** — actualizar `NavBar` (4 tabs), actualizar `App.tsx` (rutas nuevas)
5. **ProjectsPage** — extraer grilla de proyectos de DashboardPage → nueva página `/projects`
6. **Refactor DashboardPage** — quitar ParaTabs, añadir secciones de highlights
7. **Componentes Áreas** — `AreaCard` → `AreaForm` → `AreaLogModal` → `AreaLogItem`
8. **AreasPage** — grid de tarjetas
9. **AreaDetailPage** — historial de logs
10. **Eliminar ParaTabs** — borrar archivo
11. **Verificación** — smoke test manual en browser contra cada criterio de éxito

---

## Criterios de Éxito

### Navegación
- [ ] NavBar tiene 4 destinos: Inbox, Dashboard, Proyectos, Áreas
- [ ] La ruta `/projects` muestra la grilla de proyectos activos
- [ ] La ruta `/areas` muestra las tarjetas de áreas
- [ ] Dashboard no tiene ParaTabs — muestra highlights de proyectos y áreas al mismo tiempo
- [ ] `ParaTabs.tsx` eliminado del codebase

### Dashboard
- [ ] Sección "Proyectos activos" muestra máximo 3 proyectos con barra de progreso compacta
- [ ] Sección "Áreas" muestra todas las áreas con su último avance
- [ ] "Ver todos →" y "Ver áreas →" navegan a sus páginas respectivas
- [ ] El botón "Registrar" en la fila de un área abre el modal sin navegar

### Áreas
- [ ] El usuario puede crear un área (título + descripción opcional + color)
- [ ] El usuario puede registrar un avance con fecha retroactiva
- [ ] "hace X días" se calcula correctamente desde `last_logged_at`
- [ ] Si `last_logged_at` es null, muestra "Sin avances aún" (nunca en rojo)
- [ ] La vista de detalle muestra los logs en orden cronológico inverso
- [ ] Eliminar un área elimina todos sus logs (cascada)

### UX / TDAH
- [ ] No hay racha, no hay meta de frecuencia, no hay indicador de "atrasado"
- [ ] El modal de registro tiene exactamente dos campos: texto + fecha
- [ ] "Sin avances aún" es neutral — no hay color de advertencia ni ícono de alerta

---

## Fuera de Alcance (v1)

- ❌ Resources y Archives funcionales
- ❌ Editar o eliminar un log individual
- ❌ Filtrar logs por rango de fechas
- ❌ Color del área editable después de crearse (se puede añadir en v2)
- ❌ Archivar/desactivar un área
- ❌ Vincular un avance a un proyecto o tarea
