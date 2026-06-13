import type { AreaLog } from '../types/areas'
import './AreaLogItem.css'

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  log: AreaLog
}

export default function AreaLogItem({ log }: Props) {
  return (
    <div className="area-log-item">
      <span className="area-log-date">{formatDate(log.logged_at)}</span>
      <p className="area-log-content">{log.content}</p>
    </div>
  )
}
