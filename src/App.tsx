import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import InboxPage from './pages/InboxPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import AreasPage from './pages/AreasPage'
import AreaDetailPage from './pages/AreaDetailPage'
import ResourcesPage from './pages/ResourcesPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/inbox" replace />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/areas" element={<AreasPage />} />
        <Route path="/areas/:id" element={<AreaDetailPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
