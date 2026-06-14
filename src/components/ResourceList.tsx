import type { Resource, ResourceFilters as Filters } from '../types/resources'
import ResourceFilters from './ResourceFilters'
import ResourceItem from './ResourceItem'
import './ResourceList.css'

interface Props {
  resources: Resource[]
  filters: Filters
  allTags: string[]
  onFiltersChange: (f: Filters) => void
  onToggleRead: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export default function ResourceList({
  resources,
  filters,
  allTags,
  onFiltersChange,
  onToggleRead,
  onArchive,
  onDelete,
}: Props) {
  return (
    <div className="resource-list">
      <ResourceFilters filters={filters} allTags={allTags} onChange={onFiltersChange} />

      {resources.length === 0 ? (
        <p className="resource-list-empty">
          {filters.search || filters.type || filters.status || filters.tag
            ? 'Sin resultados para estos filtros.'
            : 'Aún no tienes resources. ¡Añade el primero arriba!'}
        </p>
      ) : (
        <div className="resource-list-items">
          {resources.map(r => (
            <ResourceItem
              key={r.id}
              resource={r}
              onToggleRead={onToggleRead}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
