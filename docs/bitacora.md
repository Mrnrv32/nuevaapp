# Bitácora del Proyecto — App TDAH "Segundo Cerebro"

Registro cronológico de sesiones. Entrada más reciente primero.

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
