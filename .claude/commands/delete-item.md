Skill: deleteItem
Archivo: src/skills/deleteItem.ts

Elimina un inbox item por ID. Hard delete, sin confirmación (spec explícito: no añadir fricción al usuario TDAH).

## Firma
```ts
deleteItem(id: string): Promise<void>
```

## Código completo
```ts
import { supabase } from '../lib/supabase'

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('inbox_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

## Uso en React
```ts
import { deleteItem } from '../skills/deleteItem'

await deleteItem(item.id)
// Actualizar estado local removiendo el item del array
```

## Reglas
- NO pedir confirmación al usuario — spec explícito
- Eliminar optimistamente del estado React antes del await para UX fluida
- RLS protege: solo el dueño puede eliminar su item
