# Dashboard & Sistema de Proyectos — Spec v1.0

**Estado:** Aprobado · 2026-06-13  
**Módulo anterior:** [inbox-spec.md](inbox-spec.md) ✅

---

## Contexto

El Inbox ya funciona: captura ideas sin fricción. El problema ahora es que esas ideas no van a ningún lado — no hay estructura para convertirlas en trabajo real. Este módulo resuelve la **parálisis por análisis**: dado un conjunto de ideas/proyectos, el usuario con TDAH necesita un "cockpit" que le diga exactamente qué hacer sin abrumarlo.

---

## Arquitectura: P.A.R.A. Completo

El sistema usa la metodología P.A.R.A. de Tiago Forte, implementada como **tabs en la página Dashboard**:

| Tab | Definición | Estado en v1 |
|-----|-----------|-------------|
| **Projects** | Trabajo con resultado final concreto | ✅ Funcional |
| **Areas** | Responsabilidades continuas sin fecha de fin | 🔒 "Próximamente" |
| **Resources** | Material de referencia y aprendizaje | 🔒 "Próximamente" |
| **Archives** | Todo lo completado o inactivo | 🔒 "Próximamente" |

Las 4 tabs son visibles desde el día 1. Las 3 tabs no-Projects muestran un mensaje "Próximamente" y están deshabilitadas. La tab activa por defecto es **Projects**.

---

## Página: Dashboard (Mission Control)

**Ruta:** `/dashboard`

### Layout

```
┌─────────────────────────────────────────┐
│  [Banner Inbox — solo si hay items]     │  ← condicional, sin número
├─────────────────────────────────────────┤
│  TAREAS DE HOY                          │  ← cross-project, solo con fecha=hoy
│  · [Proyecto A] Escribir intro          │
│  · [Proyecto B] Revisar presupuesto     │
├─────────────────────────────────────────┤
│  [Projects] [Areas] [Resources] [Archives] │  ← tabs P.A.R.A.
├─────────────────────────────────────────┤
│  PROYECTOS ACTIVOS                      │
│  ┌──────────┐ ┌──────────┐             │
│  │ Proyecto │ │ Proyecto │             │
│  │ 3/8 ████ │ │ 1/5 ██   │             │
│  └──────────┘ └──────────┘             │
└─────────────────────────────────────────┘
```

### Reglas de visibilidad — qué NO aparece

- ❌ Proyectos con status `completed` o `archived`
- ❌ Proyectos con status `on_hold`
- ❌ Tareas sin `due_date` (no contaminan el panel "Tareas de Hoy")
- ❌ Contador numérico del Inbox (genera ansiedad)
- ✅ Banner "Tienes items sin procesar en el Inbox" → aparece **solo si** `inbox_items` con `status='inbox'` existe, sin mostrar cuántos

### Panel "Tareas de Hoy"

- Muestra tareas con `due_date = TODAY` de todos los proyectos activos
- Cada tarea muestra: `[Nombre proyecto] · Título de tarea · estimado`
- Click en la tarea navega al proyecto al que pertenece
- Si no hay tareas para hoy: el panel no existe en el DOM (no mostrar "0 tareas")

---

## Entidad: Project

### Schema SQL — tabla `projects`

```sql
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'on_hold', 'completed', 'archived')),
  para_type   TEXT NOT NULL DEFAULT 'project'
                CHECK (para_type IN ('project', 'area', 'resource', 'archive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### TypeScript — `src/types/projects.ts`

```ts
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type ParaType = 'project' | 'area' | 'resource' | 'archive'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  status: ProjectStatus
  para_type: ParaType
  created_at: string
  updated_at: string
}

export type NewProject = Pick<Project, 'title' | 'description' | 'para_type'>
```

---

## Entidad: Task

### Schema SQL — tabla `tasks`

```sql
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'done')),
  due_date      DATE,
  time_estimate TEXT,   -- valores sugeridos: '15min','30min','1h','2h','4h'; acepta texto libre
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### TypeScript — `src/types/tasks.ts`

```ts
export type TaskStatus = 'pending' | 'in_progress' | 'done'
export type TimeEstimate = '15min' | '30min' | '1h' | '2h' | '4h' | string

export interface Task {
  id: string
  project_id: string
  user_id: string
  title: string
  status: TaskStatus
  due_date: string | null   // ISO date 'YYYY-MM-DD'
  time_estimate: TimeEstimate | null
  position: number
  created_at: string
  updated_at: string
}

export type NewTask = Pick<Task, 'title' | 'due_date' | 'time_estimate'>
```

---

## Feature: Generador de Prompt para IA

Sin API externa. El usuario copia un prompt generado, lo pega en Claude/ChatGPT, obtiene la lista de tareas, y la pega de vuelta en la app.

### Flujo

1. Al crear/editar un proyecto, botón **"Generar tareas con IA"**
2. Se abre `AIPromptModal` con dos zonas:

**Zona 1 — Prompt generado (readonly, copiable):**
```
Soy una persona con TDAH trabajando en el siguiente proyecto:

Título: [título del proyecto]
Descripción: [descripción]

Por favor, desglosa este proyecto en tareas concretas y accionables.
Cada tarea debe:
- Empezar con un verbo de acción (Escribir, Revisar, Enviar, Crear...)
- Ser completable en 15–120 minutos
- Ser autónoma (no depender de otra para poder comenzar)

Responde SOLO con la lista, una tarea por línea, con guión:
- [tarea 1]
- [tarea 2]
```

**Zona 2 — Pegar resultado:**
- `<textarea>` con placeholder "Pega aquí la respuesta de Claude o ChatGPT..."
- Botón "Importar tareas"
- Al importar: parsear líneas con prefijos `- `, `• `, o `N. ` → crear tareas con `status='pending'`

### Props del componente

```ts
interface AIPromptModalProps {
  project: Project
  onImport: (titles: string[]) => Promise<void>
  onClose: () => void
}
```

---

## Página: Project Detail

**Ruta:** `/projects/:id`

```
← Volver al Dashboard
[Título del Proyecto]     [status badge: Active]
[Descripción]

[+ Nueva tarea]  [Generar con IA]

TAREAS
□ Escribir intro           15min  · 14 jun
▶ Revisar presupuesto      1h     · hoy
✓ Enviar propuesta inicial 30min  ·
```

- Las tareas se ordenan por `position`
- Las tareas `done` aparecen al final, visualmente atenuadas
- Click en el icono de estado cicla: `pending → in_progress → done → pending`

---

## Routing

**Dependencia a instalar:** `react-router-dom` v7

| Path | Componente |
|------|-----------|
| `/` | Redirect → `/inbox` |
| `/inbox` | `InboxPage` |
| `/dashboard` | `DashboardPage` |
| `/projects/:id` | `ProjectDetailPage` |

`NavBar` pasa de botones estáticos a `<NavLink>` de react-router-dom.

---

## Componentes Nuevos

| Componente | Ubicación | Descripción |
|-----------|----------|-------------|
| `DashboardPage` | `src/pages/` | Orquesta banner inbox + tareas hoy + tabs P.A.R.A. |
| `ParaTabs` | `src/components/` | Tabs P.A.R.A. con estado activo |
| `TodayTasksList` | `src/components/` | Panel cross-project de tareas con due_date=hoy |
| `ProjectCard` | `src/components/` | Card con título, descripción y barra de progreso |
| `ProjectForm` | `src/components/` | Form crear/editar proyecto |
| `ProjectDetailPage` | `src/pages/` | Vista de un proyecto con su lista de tareas |
| `TaskItem` | `src/components/` | Fila de tarea: estado (click-to-cycle), título, fecha, estimado |
| `TaskForm` | `src/components/` | Form inline para añadir nueva tarea |
| `AIPromptModal` | `src/components/` | Modal con prompt generado + textarea para importar |

---

## Skills Nuevos

| Archivo | Función exportada | Operación |
|--------|------------------|-----------|
| `getProjects.ts` | `getProjects(paraType?)` → `Project[]` | SELECT activos (status='active') |
| `createProject.ts` | `createProject(input: NewProject)` → `Project` | INSERT |
| `updateProject.ts` | `updateProject(id, patch)` → `Project` | UPDATE |
| `getTasks.ts` | `getTasks(projectId)` → `Task[]` | SELECT por proyecto, orden por position |
| `getTodayTasks.ts` | `getTodayTasks()` → `Task[]` | SELECT due_date=CURRENT_DATE, join projects |
| `createTask.ts` | `createTask(projectId, input: NewTask)` → `Task` | INSERT |
| `updateTask.ts` | `updateTask(id, patch)` → `Task` | UPDATE (status, due_date, etc.) |
| `deleteTask.ts` | `deleteTask(id)` → `void` | DELETE |
| `checkInboxHasItems.ts` | `checkInboxHasItems()` → `boolean` | SELECT COUNT > 0, status='inbox' |
| `importTasksFromText.ts` | `importTasksFromText(projectId, rawText)` → `Task[]` | Parse + bulk INSERT |

---

## Criterios de Éxito

### Funcionalidad
- [ ] El usuario puede crear un proyecto (title + description + para_type)
- [ ] El usuario puede ver todos sus proyectos activos en el Dashboard tab Projects
- [ ] Los proyectos `on_hold`, `completed` y `archived` **no aparecen** en el Dashboard
- [ ] Existe una sección "Tareas de Hoy" que muestra solo tareas con `due_date = today`
- [ ] Si el Inbox tiene items sin procesar, aparece el banner (sin número exacto)
- [ ] Si el Inbox está vacío, el banner **no existe** en el DOM
- [ ] El usuario puede navegar al detalle de un proyecto y ver/crear/editar tareas
- [ ] El usuario puede cambiar el status de una tarea con un solo click
- [ ] El flujo de IA funciona end-to-end: prompt generado → copiar → pegar resultado → tareas importadas

### UX / TDAH
- [ ] Sin estados de carga visibles en el camino dorado (datos ya cargados antes de renderizar)
- [ ] No hay ningún contador numérico del Inbox visible en el Dashboard
- [ ] Las tareas sin `due_date` no aparecen en el panel "Tareas de Hoy"
- [ ] El cambio de status de tarea es un click, sin formulario ni confirmación

### Calidad de Código
- [ ] Cada skill tiene un único propósito y una única operación de BD
- [ ] Los tipos están en `src/types/projects.ts` y `src/types/tasks.ts`
- [ ] RLS habilitado en ambas tablas nuevas
- [ ] La migración de BD se aplica sin errores en Supabase

---

## Fuera de Alcance (v1)

- ❌ Areas, Resources, Archives funcionales (solo placeholders en tabs)
- ❌ Deadline del proyecto (solo las tareas tienen fecha)
- ❌ Drag & drop para reordenar tareas
- ❌ Integración directa con API de IA
- ❌ Autenticación (bloqueante conocido — igual que en Inbox)
- ❌ FK real entre `inbox_items.destination_note` y `projects.id` (preparado en `processItem.ts`, se activa cuando exista auth)

---

## Orden de Implementación

Siguiendo la regla **Inner Loop First / Schema antes de Frontend**:

1. **Schema BD** — migración con tablas `projects` + `tasks`
2. **Types** — `src/types/projects.ts`, `src/types/tasks.ts`
3. **Skills** — todos los listados arriba, en el orden de la tabla
4. **Routing** — instalar `react-router-dom`, configurar rutas en `main.tsx`, actualizar `NavBar`
5. **Componentes** — de adentro hacia afuera: `TaskItem` → `ProjectCard` → `TodayTasksList` → `ParaTabs` → `DashboardPage` → `ProjectDetailPage`
6. **AI Modal** — `AIPromptModal` + `importTasksFromText`
7. **Verificación** — smoke test manual en browser contra cada criterio de éxito

---

## Decisiones Clave Confirmadas

| Decisión | Respuesta |
|---------|-----------|
| No hay deadline a nivel proyecto (solo en tareas) | ✅ Confirmado |
| Dashboard muestra SOLO proyectos con status `active` | ✅ Confirmado |
| 4 tabs P.A.R.A. visibles; 3 muestran "Próximamente" | ✅ Confirmado |
| `time_estimate` acepta enum sugerido + texto libre | ✅ Confirmado |
| Inbox → Proyecto solo desde el Inbox (ya construido) | ✅ Confirmado |
| Feature de prompt IA: modal con copy+paste, sin API externa | ✅ Confirmado |
