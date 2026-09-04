'use client'

import { useEffect } from 'react'
import './HelpLayout.css'

interface HelpLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function HelpLayout({ title, subtitle, children }: HelpLayoutProps) {
  useEffect(() => {
    document.body.classList.add('dark-theme-body')
    return () => {
      document.body.classList.remove('dark-theme-body')
    }
  }, [])

  return (
    <main className="help-container reveal">
      <h1 className="main-title">{title}</h1>
      {subtitle ? <p className="help-subtitle">{subtitle}</p> : null}
      {children}
    </main>
  )
}
