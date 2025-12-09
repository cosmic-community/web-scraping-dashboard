import type { ScrapingResult } from '@/types'

export default function RecentResults({ results }: { results: ScrapingResult[] }) {
  if (!results || results.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Aucun résultat disponible</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {results.map((result) => {
        const timestamp = result.metadata?.timestamp ? new Date(result.metadata.timestamp) : null;
        const formattedDate = timestamp ? timestamp.toLocaleString('fr-FR') : 'Date inconnue';
        
        return (
          <div key={result.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${result.metadata?.status === 'Success' ? 'bg-success' : 'bg-error'}`}></span>
                  <span className="text-sm font-medium">
                    {result.metadata?.status === 'Success' ? 'Succès' : 'Échec'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400">{formattedDate}</p>
              </div>
              
              {result.metadata?.items_count !== undefined && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{result.metadata.items_count}</div>
                  <div className="text-xs text-gray-400">items</div>
                </div>
              )}
            </div>
            
            {result.metadata?.execution_time !== undefined && (
              <div className="text-xs text-gray-500 mt-2">
                Temps d'exécution: {result.metadata.execution_time}ms
              </div>
            )}
            
            {result.metadata?.error_message && (
              <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
                {result.metadata.error_message}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}