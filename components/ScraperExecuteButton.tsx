'use client'

import { useState } from 'react'

export default function ScraperExecuteButton({ scraperId }: { scraperId: string }) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const handleExecute = async () => {
    setIsExecuting(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scraperId }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult({
          success: true,
          message: `Succès! ${data.itemsCount} items scrapés en ${data.executionTime}ms`,
        })
        
        // Reload page after 2 seconds to show new results
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setResult({
          success: false,
          message: `Erreur: ${data.error}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsExecuting(false)
    }
  }
  
  return (
    <div>
      <button
        onClick={handleExecute}
        disabled={isExecuting}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExecuting ? '⏳ Exécution...' : '▶️ Exécuter'}
      </button>
      
      {result && (
        <div className={`mt-2 p-3 rounded text-sm ${result.success ? 'bg-success/10 border border-success/20 text-success' : 'bg-error/10 border border-error/20 text-error'}`}>
          {result.message}
        </div>
      )}
    </div>
  )
}