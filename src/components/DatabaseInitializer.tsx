'use client'

import { useEffect } from 'react'

export default function DatabaseInitializer() {
  useEffect(() => {
    // Initialize database on client side
    const initDB = async () => {
      try {
        await fetch('/api/init-db', { method: 'POST' })
        console.log('Database initialized successfully')
      } catch (error) {
        console.error('Database initialization failed:', error)
      }
    }
    
    initDB()
  }, [])

  return null // This component doesn't render anything
}

