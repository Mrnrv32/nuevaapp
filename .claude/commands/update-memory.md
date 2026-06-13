Actualiza la memoria persistente del proyecto y escribe una entrada en la bitácora de sesión.

## Pasos

1. Lee `CLAUDE.md` y los archivos de memoria actuales para entender el estado real del proyecto.
2. Lee `docs/bitacora.md` (si no existe, créalo con la cabecera indicada abajo).
3. Actualiza `project_tdah_app.md` en la carpeta de memoria:
   - Sincroniza "Módulos completados" con el estado real del código.
   - Añade decisiones arquitecturales nuevas que no estén documentadas.
   - Actualiza "Próximo módulo" si hay contexto del usuario sobre qué sigue.
4. Prepend una nueva entrada al inicio de `docs/bitacora.md` con el formato:

```
## [YYYY-MM-DD] — Título breve de la sesión

**Hecho:**
- bullet por cambio real implementado

**Próximos pasos:**
- bullet de lo que quedó pendiente o fue discutido pero no implementado

---
```

5. Si se crearon archivos de memoria nuevos, actualiza el índice `MEMORY.md`.
6. Confirma los archivos actualizados y el resumen de la entrada de bitácora.

## Reglas
- La bitácora es append-at-top: la entrada más reciente va primero. Nunca edites entradas anteriores.
- Fechas absolutas siempre — usa `currentDate` del contexto, no escribas "hoy" ni "ayer".
- Solo documenta cambios reales de esta conversación. No inventes ni especules sobre el código.
- No toques esquemas de BD ni archivos en `src/skills/`.
