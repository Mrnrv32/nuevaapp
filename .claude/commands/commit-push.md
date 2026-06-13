Genera un commit con todos los cambios pendientes y haz push a origin.

## Pasos

1. Corre `git status` y `git diff` en paralelo para ver qué cambió.
2. Corre `git log --oneline -5` para ver el estilo de mensajes recientes.
3. Redacta un mensaje de commit siguiendo el estilo del proyecto:
   - Prefijo convencional: `feat:`, `fix:`, `style:`, `docs:`, `refactor:`
   - Primera línea: resumen conciso en español (≤ 72 chars)
   - Cuerpo opcional si hay contexto importante
   - Siempre termina con: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
4. Agrega los archivos modificados y sin seguimiento (evita `.env` y binarios grandes).
5. Haz el commit con el mensaje redactado.
6. Haz push a origin.
7. Confirma con el hash del commit y la rama.

## Reglas
- No uses `git add -A` ni `git add .` — agrega archivos específicos por nombre.
- Si no hay cambios, dilo directamente sin crear commit vacío.
- Si el push falla por divergencia, reporta el error sin forzar.
