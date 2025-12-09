import { cosmic, hasStatus } from '@/lib/cosmic'
import type { Scraper, ScrapingResult } from '@/types'
import Link from 'next/link'
import ScraperExecuteButton from '@/components/ScraperExecuteButton'

async function getScraperWithResults(slug: string) {
  try {
    const scraperResponse = await cosmic.objects.findOne({
      type: 'scrapers',
      slug,
    }).depth(1)
    
    const scraper = scraperResponse.object as Scraper
    
    if (!scraper) {
      return null
    }
    
    // Fetch results for this scraper
    const resultsResponse = await cosmic.objects
      .find({ type: 'scraping-results' })
      .props(['id', 'title', 'metadata'])
      .depth(1)
    
    const allResults = resultsResponse.objects as ScrapingResult[]
    
    // Filter results for this scraper
    const scraperResults = allResults
      .filter(r => r.metadata?.scraper_id === scraper.id)
      .sort((a, b) => {
        const dateA = new Date(a.metadata?.timestamp || '').getTime()
        const dateB = new Date(b.metadata?.timestamp || '').getTime()
        return dateB - dateA
      })
    
    return { scraper, results: scraperResults }
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

export default async function ScraperDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getScraperWithResults(slug)
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Scraper non trouvé</h1>
          <Link href="/scrapers" className="btn-primary">
            Retour aux scrapers
          </Link>
        </div>
      </div>
    )
  }
  
  const { scraper, results } = data
  const selectors = scraper.metadata?.selectors ? JSON.parse(scraper.metadata.selectors) : {}
  
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{scraper.title}</h1>
              <p className="text-gray-400 mt-2">{scraper.metadata?.url}</p>
            </div>
            <div className="flex gap-3">
              <ScraperExecuteButton scraperId={scraper.id} />
              <Link href={`/scrapers/${scraper.slug}/edit`} className="btn-secondary">
                Modifier
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Statut</div>
                  <span className={`px-2 py-1 rounded text-sm ${scraper.metadata?.active ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-400'}`}>
                    {scraper.metadata?.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                {scraper.metadata?.description && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Description</div>
                    <p className="text-sm">{scraper.metadata.description}</p>
                  </div>
                )}
                
                {scraper.metadata?.frequency && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Fréquence</div>
                    <p className="text-sm">{scraper.metadata.frequency}</p>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Sélecteurs CSS</div>
                  <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectors, null, 2)}
                  </pre>
                </div>
                
                {scraper.metadata?.total_runs !== undefined && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Exécutions</div>
                    <p className="text-2xl font-bold">{scraper.metadata.total_runs}</p>
                  </div>
                )}
                
                {scraper.metadata?.last_run && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Dernière Exécution</div>
                    <p className="text-sm">{new Date(scraper.metadata.last_run).toLocaleString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Historique des Résultats</h2>
            
            {results.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">Aucun résultat disponible</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => {
                  const timestamp = result.metadata?.timestamp ? new Date(result.metadata.timestamp) : null
                  const formattedDate = timestamp ? timestamp.toLocaleString('fr-FR') : 'Date inconnue'
                  
                  return (
                    <div key={result.id} className="card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-3 h-3 rounded-full ${result.metadata?.status === 'Success' ? 'bg-success' : 'bg-error'}`}></span>
                            <span className="font-medium">
                              {result.metadata?.status === 'Success' ? 'Succès' : 'Échec'}
                            </span>
                            <span className="text-sm text-gray-400">{formattedDate}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {result.metadata?.items_count !== undefined && (
                              <span>{result.metadata.items_count} items</span>
                            )}
                            {result.metadata?.execution_time !== undefined && (
                              <span>{result.metadata.execution_time}ms</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {result.metadata?.error_message && (
                        <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded text-sm text-error">
                          {result.metadata.error_message}
                        </div>
                      )}
                      
                      {result.metadata?.data && result.metadata.status === 'Success' && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-primary hover:text-blue-400">
                            Voir les données ({result.metadata.items_count || 0} items)
                          </summary>
                          <pre className="mt-2 bg-background p-3 rounded text-xs overflow-x-auto max-h-96">
                            {JSON.stringify(JSON.parse(result.metadata.data), null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/scrapers" className="text-primary hover:text-blue-400">
            ← Retour aux scrapers
          </Link>
        </div>
      </main>
    </div>
  )
}