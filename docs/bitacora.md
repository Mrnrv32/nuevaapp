# Bitácora del Proyecto — App TDAH "Segundo Cerebro"

Registro cronológico de sesiones. Entrada más reciente primero.

---

## 2026-06-13 — Edición inline, borrado protegido y menú ⚙

**Hecho:**
- Nuevo skill `src/skills/updateItem.ts`: PATCH en `inbox_items` por ID, devuelve el ítem actualizado.
- Nuevo skill `src/skills/deleteProject.ts`: DELETE en `projects` por ID.
- `InboxListItem.tsx`: edición inline (textarea en lugar del texto, Enter guarda / Escape+onBlur cancela), borrado en 2 pasos (`confirming` boolean, label ámbar "¿Eliminar?", segundo clic ejecuta), botones `opacity:0` en reposo / `1` en hover o seleccionado.
- `InboxListItem.tsx`: patrón clic-to-reveal — estado `selected`; clic en `.inbox-item-body` hace toggle; `<li tabIndex={0}>` con `onBlur` desactiva (usando `e.currentTarget.contains(e.relatedTarget)`); botones usan `stopPropagation`.
- `TaskItem.tsx`: misma edición inline (input de una línea) y borrado en 2 pasos que InboxListItem.
- `ProjectForm.tsx`: prop `initial?: Project` para modo edición — pre-rellena title/description, cambia heading y label del botón. Sin cambios de firma en `onSave`.
- `ProjectDetailPage.tsx`: menú ⚙ con 3 opciones — Editar (abre `ProjectForm` con `initial`), Archivar (`updateProject` → `status: 'archived'`), Eliminar (2 pasos → `deleteProject` → navega a `/projects`). Cierre al clic exterior con `useRef + mousedown`.
- `AreaDetailPage.tsx`: menú ⚙ con 2 opciones — Editar (abre `AreaForm` con `initial`), Eliminar (2 pasos → `deleteArea` → navega a `/areas`).
- CSS: clases del dropdown (`.project-gear-wrap`, `.project-gear-btn`, `.project-gear-menu`, `.project-menu-item`, `--danger`, `--confirm`) en ambos archivos de página.
- Commits `d89f657` y `059927c` pusheados a `master`.
- Memoria del proyecto actualizada: tabla de 4 patrones UI establecidos, skills nuevos, AreaForm/ProjectForm modo edición.

**Próximos pasos:**
- Próximo módulo sin definir — candidatos: Archives ("A" de P.A.R.A.), dark mode, Resources v2 (vista tabla, detalle `/resources/:id`), mejoras de responsivo móvil.
- Resources v1 sin: edición inline de recursos (patrón ya establecido, fácil de aplicar), upload de PDFs, import masivo de bookmarks.

---

## 2026-06-13 — Módulo Resources v1.0

**Hecho:**
- Entrevista de spec con el usuario: Resources = "cosa que quiero revisar después" (links, libros, notas). Auto-fetch de metadata acordado como feature central.
- Spec documentado en `docs/specs/resources-spec.md` y aprobado antes de implementar.
- Plan por fases creado y aprobado: Schema → Edge Function → Types → Skills → Componentes → Página → NavBar.
- Migración `create_resources_table` aplicada en Supabase: tabla `resources` con RLS pública, índices GIN para tags, trigger `updated_at`.
- Edge Function `fetch-url-metadata` desplegada (Deno, `verify_jwt: false`): YouTube via oEmbed, cualquier URL via fetch server-side + extracción de og:title/og:description/og:image.
- Types: `src/types/resources.ts` — `ResourceType`, `ResourceStatus`, `Resource`, `NewResource`, `ResourcePatch`, `ResourceFilters`, `UrlMetadata`.
- 4 skills: `getResources` (filtros: status/type/tag/search), `createResource`, `updateResource`, `deleteResource`.
- 5 componentes nuevos: `TagInput` (chips de texto libre, Enter/coma añade, Backspace elimina), `ResourceCapture` (selector tipo + URL con auto-fetch onBlur + spinner + TagInput), `ResourceItem` (fila densa con expand inline, toggle leído, delete), `ResourceFilters` (tabs estado + búsqueda debounce 300ms + selects tipo/tag), `ResourceList` (contenedor puro).
- Página `/resources` (`ResourcesPage.tsx`): captura siempre visible arriba, lista filtrable abajo, `useMemo` para derivar `allTags` del array local.
- NavBar: 5to destino "Resources" + `overflow-x: auto; scrollbar-width: none` para móvil.
- Verificado en browser (2026-06-13): auto-fetch YouTube funcionó (título "Rick Astley - Never Gonna Give You Up"), tags, filtros, marcar leído, eliminar.
- Commit `8fae78d` pusheado a `master`.

**Próximos pasos:**
- Próximo módulo sin definir — candidatos: Archives ("A" de P.A.R.A.), mejoras de dark mode, vista de tabla para Resources v2.
- Resources v1 sin: upload de PDFs, página de detalle `/resources/:id`, drag & drop, import masivo de bookmarks.

---

## 2026-06-13 — Auditoría UX-TDAH + 5 fixes de presentación

**Hecho:**
- Auditoría completa como usuario con TDAH: recorrido cognitivo comparando specs (`inbox-spec.md`, `dashboard-spec.md`) contra el código real de componentes
- Reporte estructurado con fricciones UX, gap analysis técnico y feedback en primera persona
- 5 fixes de presentación implementados, verificados en browser y pusheados en commit `289bad4`:
  1. `InboxCapture.tsx` — quitado `disabled={saving}` del textarea: sin freeze ni teclado que desaparece en móvil durante el guardado
  2. `InboxCapture.tsx/css` — auto-grow del textarea (JS scrollHeight + `overflow: hidden`): crece con el contenido, sin scrollbar interno prematuro
  3. `DashboardPage.tsx/css` — banner "Tienes items sin procesar" convertido en `<button>` que navega a `/inbox` al hacer click
  4. `DashboardPage.tsx` + `ProjectCard.tsx/css` — contador `0/0` reemplazado por "+ Añadir tarea" en teal suave (65% opacity) para proyectos sin tareas
  5. `DashboardPage.tsx` — cabecera "Proyectos activos" muestra "Ver todos (N) →" cuando hay más de 3 proyectos activos
- Creada skill `/update-memory` en `.claude/commands/update-memory.md`

**Próximos pasos:**
- Próximo módulo sin definir — requiere entrevista con el usuario para priorizar
- Candidatos identificados: placeholders para Resources y Archives (spec v1.0 los pedía como "Próximamente"); mejoras de dark mode
- No hay deuda técnica crítica pendiente: todos los módulos actuales tienen sus specs aprobados y están verificados en browser

---
