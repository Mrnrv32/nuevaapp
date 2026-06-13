# Spec — Bandeja de Entrada (Inbox)
**Versión:** 1.0 | **Fecha:** 2026-06-12 | **Estado:** APROBADO

---

## 1. Problema que resuelve

El cerebro con TDAH pierde ideas de la memoria de trabajo en segundos. El problema no es falta de ideas — son 4-5 diarias que se escapan — sino que:

- **La fricción mata la captura**: cualquier campo extra, decisión o navegación rompe el impulso
- **La interfaz ambigua activa el instinto de planear**: sin una señal clara de "esto es solo un vaciado", el cerebro quiere desarrollar en lugar de soltar
- **No existe confirmación de seguridad**: sin feedback de que la idea fue guardada, la mente sigue ocupando espacio mental con ella

---

## 2. Usuario

Único. Sin colaboración. Usa la app en móvil (en movimiento) y desktop (en casa/trabajo) indistintamente.

---

## 3. Escenario de éxito

> *Estoy caminando. Se me ocurre una idea de implementación para el trabajo. Abro la app — ya estoy en el Inbox. Escribo la idea en segundos, sin pensar dónde va ni qué es. Presiono guardar. Veo un indicador verde. La pantalla se vacía. Sigo caminando. La idea está a salvo — puedo olvidarla.*

---

## 4. Flujo principal

```
Abrir app
    └─> Pantalla de Inbox (estado: campo vacío, cursor activo)
            └─> Escribir idea (texto libre)
            └─> [Opcional] Seleccionar etiqueta: Idea / Tarea / ambas
            └─> Guardar
                    └─> Indicador verde (feedback breve, ~1.5s)
                    └─> Campo se vacía → listo para la siguiente captura
                    └─> Idea queda almacenada en la lista del Inbox
```

---

## 5. Anatomía de la pantalla

### Zona de captura (parte superior / protagonista)
| Elemento | Detalle |
|---|---|
| Campo de texto | Área grande, placeholder: *"¿Qué tienes en mente?"*, cursor activo al cargar |
| Etiquetas opcionales | Dos chips toggleables: `Idea` · `Tarea`. Sin selección = válido. Ambas = válido. |
| Botón de guardar | Visible, acción primaria. También funciona con `Cmd/Ctrl + Enter` en desktop |
| Indicador de confirmación | Flash verde + texto *"Guardado"* sobre el campo. Desaparece en ~1.5s. No navega a ningún lado |

### Lista del Inbox (parte inferior / secundaria)
| Elemento | Detalle |
|---|---|
| Listado cronológico inverso | Más reciente arriba. Fecha/hora automática (no la escribe el usuario) |
| Chip de etiqueta | Si fue etiquetada, se muestra. Si no, sin chip |
| Acción de procesar | Un botón/ícono por ítem: abre modal para asignar a Proyecto, Rutina o Seguimiento — o crear uno nuevo |
| Acción de eliminar | Eliminar sin confirmación extra (el TDAH no necesita más fricción) |

### Navegación global
```
[ Inbox ★ ]  [ Dashboard ]  [ Proyectos ]
```
Inbox es el tab por defecto al abrir la app. Los otros dos tabs son fuera de scope de esta spec.

---

## 6. Comportamiento detallado

**Al abrir la app:**
- El cursor ya está en el campo de texto. Sin clics necesarios.

**Al guardar (campo vacío):**
- No hace nada. Sin mensaje de error. El botón simplemente no actúa.

**Al guardar (con texto):**
1. Guarda la idea con timestamp automático y etiqueta(s) seleccionadas
2. Muestra indicador verde ~1.5s
3. Limpia el campo y deselecciona etiquetas
4. El foco vuelve al campo — listo para otra captura inmediata

**Procesando una idea:**
- Toca/hace click en el ícono de procesar
- Modal simple con opciones: *Asignar a proyecto existente* / *Crear nuevo proyecto* / *Asignar a rutina* / *Seguimiento*
- Al confirmar, el ítem sale del Inbox (no desaparece, se mueve)

---

## 7. Lo que el Inbox NO hace

- No pide fecha, prioridad, descripción larga ni ningún campo adicional al capturar
- No navega a otra pantalla después de guardar
- No muestra notificaciones ni presiona a procesar ideas
- No tiene carpetas, filtros ni búsqueda (en esta versión)
- No sincroniza con herramientas externas
- No tiene límite de ideas ni "limpieza automática"

---

## 8. Criterios de éxito

1. Tiempo desde abrir la app hasta idea guardada: **< 15 segundos** en móvil
2. Capturas por sesión posibles sin salir de la pantalla: **ilimitadas**
3. Campos obligatorios al capturar: **exactamente 1** (el texto)
4. El usuario siente que la idea está **a salvo** — no ocupa más espacio mental

---

## 9. Decisiones de diseño tomadas

| Decisión | Elegida | Razón |
|---|---|---|
| Post-captura | Reset a campo vacío + indicador verde | Optimiza captura en ráfaga sin perder feedback de seguridad |
| Etiquetas | Opcional, toggleable, ambas posibles | Elimina la micro-decisión obligatoria; clasifica si quieres, no si debes |
| Metadatos de captura | Solo timestamp automático | Cero fricción; el contexto lo pone el usuario solo en el texto |
| Pantalla de inicio | Inbox directamente | Cada tap extra en el escenario del paseo es una idea perdida |
| Procesamiento | Modal desde la lista, no al capturar | Separa los modos: captura ≠ organización |

---

## 10. Schema de base de datos

**Tabla:** `public.inbox_items` — Supabase project `hnbamvpmwthhfmwatyph`

```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
text             text NOT NULL
tags             text[] NOT NULL DEFAULT '{}'        -- [] | ['idea'] | ['tarea'] | ['idea','tarea']
status           text NOT NULL DEFAULT 'inbox'       -- 'inbox' | 'processed'
destination_note text                                -- Fase 1: texto libre. Fase 2: FK a proyectos
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
```

RLS habilitado. Policy `owner_all`: `auth.uid() = user_id`.

---

## 11. Fuera de scope (esta spec)

- Tab Dashboard
- Tab Proyectos
- Sistema de Proyectos / Rutinas / Seguimientos
- Autenticación y cuentas
- Sincronización entre dispositivos
