import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './AppLayout.css'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="app-title">
          Kanban
        </Link>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
