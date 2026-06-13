# Spec: Proceso Real — Inbox v2.0

**Estado:** Aprobado 2026-06-13  
**Problema:** Al procesar un inbox item, el modal pide un texto libre y el item desaparece al vacío — no crea nada accionable en la app.

---

## Flujo nuevo

El ProcessModal pasa de 1 paso a 2:

**Paso 1 — Elegir destino** (3 opciones grandes)

| Destino | Icono | Acción |
|---------|-------|--------|
| Proyecto | ◆ | Convierte el item en tarea dentro de un proyecto |
| Área | ▣ | Convierte el item en log dentro de un área |
| Archivar | ⊙ | Comportamiento actual: texto libre, sin acción |

**Paso 2 — Detalles según destino**

- **Proyecto**: selector de proyectos activos + título de tarea (pre-relleno con texto del item, editable)
- **Área**: selector de áreas
- **Archivar**: campo de texto libre (igual que hoy)

Botón "← atrás" en el paso 2 regresa al paso 1.

---

## Cambios de código

### Sin cambios de schema
No se necesita migración — usa tablas existentes: `tasks`, `area_logs`, `inbox_items`.

### Skills usados (sin cambios)
- `createTask(projectId, { title, due_date: null, time_estimate: null })`
- `createAreaLog(areaId, { content, logged_at: hoy })`
- `processItem({ id, destinationNote })`  — siempre al final para marcar processed

### Archivos modificados
- `src/components/ProcessModal.tsx` — reescritura completa (máquina de estados)
- `src/components/ProcessModal.css` — estilos del paso 1 (destination cards)
- `src/pages/InboxPage.tsx` — nuevo handleProcess que orquesta las 3 rutas

### Tipo nuevo (inline en ProcessModal.tsx)
```ts
type Destination =
  | { type: 'project'; projectId: string; taskTitle: string }
  | { type: 'area'; areaId: string }
  | { type: 'archive'; note: string }
```

---

## UX / Diseño (Warm Minimalism)

- Paso 1: 3 tarjetas horizontales con hover `translateY(-2px)` + `var(--shadow)`
- Paso 2: transición suave `opacity + translateY` entre pasos
- Select nativo con estilos de input existentes
- Sin cambios en animaciones del backdrop/modal
