import { useCallback, useEffect, useMemo, useState } from 'react'
import { getResources } from '../skills/getResources'
import { updateResource } from '../skills/updateResource'
import { deleteResource } from '../skills/deleteResource'
import type { Resource, ResourceFilters } from '../types/resources'
import ResourceCapture from '../components/ResourceCapture'
import ResourceList from '../components/ResourceList'
import './ResourcesPage.css'

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filters, setFilters] = useState<ResourceFilters>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getResources(filters)
      setResources(data)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  function handleCapture(resource: Resource) {
    setResources(prev => [resource, ...prev])
  }

  async function handleToggleRead(id: string) {
    const current = resources.find(r => r.id === id)
    if (!current) return
    const next = current.status === 'read' ? 'pending' : 'read'
    const updated = await updateResource(id, { status: next })
    setResources(prev => prev.map(r => r.id === id ? updated : r))
  }

  async function handleDelete(id: string) {
    await deleteResource(id)
    setResources(prev => prev.filter(r => r.id !== id))
  }

  const allTags = useMemo(() => {
    const set = new Set<string>()
    resources.forEach(r => r.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [resources])

  if (loading) return null

  return (
    <main className="resources-page">
      <div className="resources-container">
        <h1 className="resources-title">Resources</h1>
        <div className="resources-card">
          <ResourceCapture onCapture={handleCapture} />
          <ResourceList
            resources={resources}
            filters={filters}
            allTags={allTags}
            onFiltersChange={setFilters}
            onToggleRead={handleToggleRead}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </main>
  )
}
