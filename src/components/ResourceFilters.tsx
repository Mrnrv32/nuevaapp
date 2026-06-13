import { useEffect, useState } from 'react'
import type { ResourceFilters as Filters, ResourceType, ResourceStatus } from '../types/resources'
import './ResourceFilters.css'

interface Props {
  filters: Filters
  allTags: string[]
  onChange: (f: Filters) => void
}

const STATUS_TABS: { label: string; value: ResourceStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Leídos', value: 'read' },
]

export default function ResourceFilters({ filters, allTags, onChange }: Props) {
  const [search, setSearch] = useState(filters.search ?? '')

  useEffect(() => {
    const t = setTimeout(() => {
      const s = search.trim() || undefined
      if (s !== filters.search) onChange({ ...filters, search: s })
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="resource-filters">
      <div className="resource-filters-top">
        <div className="resource-filters-tabs">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.label}
              type="button"
              className={`resource-filter-tab${filters.status === tab.value ? ' resource-filter-tab--active' : ''}`}
              onClick={() => onChange({ ...filters, status: tab.value })}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          className="resource-filters-search"
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="resource-filters-selects">
        <select
          className="resource-filters-select"
          value={filters.type ?? ''}
          onChange={e => onChange({ ...filters, type: (e.target.value as ResourceType) || undefined })}
        >
          <option value="">Tipo: todos</option>
          <option value="link">🔗 Link</option>
          <option value="book">📖 Libro</option>
          <option value="note">📝 Nota</option>
        </select>

        <select
          className="resource-filters-select"
          value={filters.tag ?? ''}
          onChange={e => onChange({ ...filters, tag: e.target.value || undefined })}
        >
          <option value="">Tag: todos</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>#{tag}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
