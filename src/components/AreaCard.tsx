import type { AreaWithLastLog } from '../types/areas'
import './AreaCard.css'

function relativeDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const logged = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((today.getTime() - logged.getTime()) / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  return `hace ${days} días`
}

interface Props {
  area: AreaWithLastLog
  onLog: () => void
  onClick: () => void
}

export default function AreaCard({ area, onLog, onClick }: Props) {
  return (
    <article
      className="area-card"
      style={{ borderLeftColor: area.color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <h3 className="area-card-title">{area.title}</h3>
      {area.description && <p className="area-card-desc">{area.description}</p>}
      <div className="area-card-footer">
        <span className="area-card-log">
          {area.last_logged_at ? relativeDate(area.last_logged_at) : 'Sin avances aún'}
        </span>
        <button
          type="button"
          className="area-card-btn"
          onClick={e => { e.stopPropagation(); onLog() }}
        >
          Registrar avance
        </button>
      </div>
    </article>
  )
}
