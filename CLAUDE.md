# CLAUDE.md

## Contexto del Proyecto

App web para adultos con TDAH. Resuelve tres problemas centrales:
- **Disfunción ejecutiva**: captura rápida de ideas sin fricción
- **Problemas de memoria**: organización automática inspirada en P.A.R.A. y C.O.D.E.
- **Parálisis por análisis**: desglose de proyectos en tareas accionables en un dashboard visual

Stack: Vite + React + TypeScript · Supabase (PostgreSQL + Auth + RLS). Arquitectura modular orientada a componentes.

**Supabase project:** `hnbamvpmwthhfmwatyph` (us-west-2)
**Skills:** `src/skills/` · **Tipos:** `src/types/` · **Specs:** `docs/specs/`

---

## Regla de Verificación (Obligatoria)

Antes de cualquier tarea de múltiples pasos, escribe cómo vas a verificar tu trabajo:
> "Verificaré esto [corriendo X / revisando Y / probando Z en el browser]"

No empieces a construir sin tener claro cómo confirmar que funciona.

---

## Custom Skills

Invocar con `/nombre-del-skill`. Código en `src/skills/`. Documentación en `.claude/commands/`.

**Inbox**

| Skill | Archivo | Descripción |
|-------|---------|-------------|
| `/capture-idea` | `captureIdea.ts` | Persiste texto + tags opcionales en inbox |
| `/get-inbox-items` | `getInboxItems.ts` | Devuelve items con status='inbox', orden desc |
| `/delete-item` | `deleteItem.ts` | Hard delete por ID, sin confirmación |
| `/process-item` | `processItem.ts` | Mueve item a 'processed' con nota de destino |
| — | `checkInboxHasItems.ts` | Retorna `boolean` — si hay items pendientes en inbox |

**Proyectos**

| Archivo | Descripción |
|---------|-------------|
| `getProjects.ts` | Lista proyectos activos; acepta filtro opcional `ParaType` |
| `createProject.ts` | Inserta un proyecto nuevo |
| `updateProject.ts` | Actualiza campos de un proyecto por ID |
| `getDashboardProjects.ts` | Proyectos activos con conteo de tareas totales y completadas (para tarjetas de progreso) |

**Tareas**

| Archivo | Descripción |
|---------|-------------|
| `getTasks.ts` | Lista tareas de un proyecto, ordenadas por `position` |
| `getTodayTasks.ts` | Tareas con `due_date = hoy` y `status != done`, incluye `project_title` |
| `createTask.ts` | Inserta una tarea en un proyecto |
| `updateTask.ts` | Actualiza campos de una tarea por ID |
| `deleteTask.ts` | Hard delete de una tarea por ID |
| `importTasksFromText.ts` | Parsea texto (listas con `-`, `•`, `*` o numeradas) e inserta tareas en bloque |

**Specs aprobados:** `docs/specs/`
- `inbox-spec.md` — Bandeja de Entrada v1.0 ✅
- `dashboard-spec.md` — Dashboard / Proyectos ✅
- `areas-nav-refactor-spec.md` — Áreas + Refactor de Navegación ✅

---

## Estado del Proyecto

### Decisión: App de uso personal — sin autenticación

La app es personal (un solo usuario). El módulo de Autenticación queda descartado indefinidamente.
- `user_id` en `inbox_items` es nullable (migración `allow_anon_access_inbox_items`)
- RLS policy `public_all`: acceso total a roles `anon` y `authenticated`
- Ningún skill debe verificar sesión ni enviar `user_id`

### Módulo: Inbox ✅ Completo

| Capa | Archivos | Estado |
|------|---------|--------|
| Schema BD | `public.inbox_items` (migrations `20260612193314` + `allow_anon_access_inbox_items`) | ✅ RLS pública + trigger + índices |
| Types | `src/types/inbox.ts` | ✅ |
| Skills | `src/skills/captureIdea.ts`, `getInboxItems.ts`, `deleteItem.ts`, `processItem.ts` | ✅ |
| Componentes | `src/components/NavBar`, `InboxCapture`, `InboxListItem`, `ProcessModal` | ✅ |
| Página | `src/pages/InboxPage.tsx` | ✅ |

**Verificado en browser (2026-06-13):** captura, listado, proceso y eliminación funcionan sin sesión activa.

### Módulo: Proyectos + Tareas ✅ Completo

| Capa | Archivos | Estado |
|------|---------|--------|
| Types | `src/types/projects.ts`, `src/types/tasks.ts` | ✅ |
| Skills | `getProjects`, `createProject`, `updateProject`, `getDashboardProjects`, `getTasks`, `getTodayTasks`, `createTask`, `updateTask`, `deleteTask`, `importTasksFromText` | ✅ |
| Componentes | `ProjectCard`, `ProjectForm`, `TaskItem`, `TaskForm`, `TodayTasksList`, `AIPromptModal` | ✅ |
| Páginas | `ProjectsPage.tsx` (`/projects`), `ProjectDetailPage.tsx` (`/projects/:id`) | ✅ |

### Módulo: Áreas + Refactor de Navegación ✅ Completo (2026-06-13)

| Capa | Archivos | Estado |
|------|---------|--------|
| Schema BD | `areas` + `area_logs` (migraciones `create_areas_and_logs` + `seed_default_areas`) | ✅ RLS pública + índices + seed |
| Types | `src/types/areas.ts` | ✅ |
| Skills | `getAreas`, `getAreasWithLastLog`, `createArea`, `updateArea`, `deleteArea`, `getAreaLogs`, `createAreaLog` | ✅ |
| Componentes | `AreaCard`, `AreaForm`, `AreaLogModal`, `AreaLogItem` | ✅ |
| Páginas | `AreasPage.tsx` (`/areas`), `AreaDetailPage.tsx` (`/areas/:id`) | ✅ |
| Nav | NavBar: 4 destinos (Inbox, Dashboard, Proyectos, Áreas) · `ParaTabs` eliminado | ✅ |
| Dashboard | Centro de mando: highlights de proyectos + áreas en una sola vista | ✅ |

**Verificado en browser (2026-06-13):** registro de avance, actualización de estado "hoy", detalle con log cronológico, navegación completa entre las 4 secciones.

### Sistema de Diseño: "Warm Minimalism" ✅ Completo (2026-06-13)

Commit `af1ca00`. 16 archivos CSS refactorizados. Sin Tailwind — CSS variables nativas en `src/index.css`.

**Tokens clave:**
- `--bg: #FAFAF9` · `--bg-card: #FDFDFC` · `--accent: #0d9488` (teal-600)
- `--text: #78716c` · `--text-h: #292524` · `--border: #E7E5E4`
- `--shadow-sm` / `--shadow` / `--shadow-lg` (sombras difusas, sin borders duros)

**Reglas para nuevos componentes:**
- Tarjetas: `background: var(--bg-card)`, `box-shadow: var(--shadow-sm)`, hover con `translateY(-2px)` + `var(--shadow)`. Sin `border: 1px solid`.
- Modales: `background: var(--bg-card)`, `border-radius: 20px`, `box-shadow: var(--shadow-lg)`, overlay `rgba(0,0,0,0.3)` + `backdrop-filter: blur(2px)`.
- Inputs: `background: var(--bg)`, `border: 1.5px solid var(--border)`, focus con `box-shadow: 0 0 0 3px var(--accent-bg)`.
- Botones primarios: `background: var(--accent)`, hover `opacity: 0.88` + `translateY(-1px)`.
- Destructivos: `#b45309` (amber), nunca rojo puro.
- Transiciones: `0.2s ease-out` general, `0.25s ease-out` para transforms.

**Tailwind:** descartado por ahora. Reconsiderar si el próximo módulo tiene 5+ componentes nuevos.

### Próximo spec: por definir

---

## Reglas de Trabajo

1. **No asumir**: Si una funcionalidad no está especificada, pregunta antes de implementar.
2. **Pasos pequeños**: Entrega código funcional incrementalmente. Un PR = una cosa.
3. **Código modular**: Componentes pequeños y reutilizables, sin dependencias innecesarias.
4. **Sin comentarios obvios**: Solo comenta el *por qué*, nunca el *qué*.
5. **Spec primero**: Entrevistar al usuario antes de escribir cualquier código. Documentar spec en `docs/specs/` antes de implementar.
6. **Inner loops antes de UI**: Identificar y construir las funciones de backend (skills) antes de construir componentes visuales.
7. **Schema antes de frontend**: Definir y aplicar la migración de BD antes de cualquier código React.
