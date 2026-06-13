import { NavLink } from 'react-router-dom'
import './NavBar.css'

const cls = ({ isActive }: { isActive: boolean }) =>
  `nav-tab${isActive ? ' nav-tab--active' : ''}`

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/inbox" className={cls}>Inbox ★</NavLink>
      <NavLink to="/dashboard" className={cls}>Dashboard</NavLink>
      <NavLink to="/projects" className={cls}>Proyectos</NavLink>
      <NavLink to="/areas" className={cls}>Áreas</NavLink>
    </nav>
  )
}
