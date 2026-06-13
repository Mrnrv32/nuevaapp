import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AreaWithLastLog, NewArea, NewAreaLog } from '../types/areas'
import { getAreasWithLastLog } from '../skills/getAreasWithLastLog'
import { createArea } from '../skills/createArea'
import { createAreaLog } from '../skills/createAreaLog'
import AreaCard from '../components/AreaCard'
import AreaForm from '../components/AreaForm'
import AreaLogModal from '../components/AreaLogModal'
import './AreasPage.css'

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaWithLastLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [logTarget, setLogTarget] = useState<AreaWithLastLog | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setAreas(await getAreasWithLastLog())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (input: NewArea) => {
    const created = await createArea(input)
    setAreas(prev => [...prev, { ...created, last_logged_at: null }])
  }

  const handleLog = async (log: NewAreaLog) => {
    if (!logTarget) return
    await createAreaLog(logTarget.id, log)
    setAreas(prev => prev.map(a =>
      a.id === logTarget.id ? { ...a, last_logged_at: log.logged_at } : a
    ))
    setLogTarget(null)
  }

  if (loading) return null

  return (
    <div className="areas-page">
      <div className="areas-grid">
        {areas.map(a => (
          <AreaCard
            key={a.id}
            area={a}
            onLog={() => setLogTarget(a)}
            onClick={() => navigate(`/areas/${a.id}`)}
          />
        ))}
        <button type="button" className="area-card-new" onClick={() => setShowForm(true)}>
          + Nueva área
        </button>
      </div>

      {showForm && (
        <AreaForm onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {logTarget && (
        <AreaLogModal area={logTarget} onSave={handleLog} onClose={() => setLogTarget(null)} />
      )}
    </div>
  )
}
