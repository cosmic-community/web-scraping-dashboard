import { cosmic, hasStatus } from '@/lib/cosmic'
import type { Scraper } from '@/types'
import Link from 'next/link'

async function getScrapers() {
  try {
    const response = await cosmic.objects
      .find({ type: 'scrapers' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return response.objects as Scraper[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

export default async function ScrapersPage() {
  const scrapers = await getScrapers()
  
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Scrapers</h1>
              <p className="text-gray-400 mt-2">Gérez vos configurations de scraping</p>
            </div>
            <Link href="/scrapers/new" className="btn-primary">
              + Nouveau Scraper
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {scrapers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">Aucun scraper configuré</p>
            <Link href="/scrapers/new" className="btn-primary inline-block">
              Créer votre premier scraper
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrapers.map((scraper) => (
              <div key={scraper.id} className="card hover:border-primary transition-colors">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{scraper.title}</h3>
                  <p className="text-sm text-gray-400 break-all">{scraper.metadata?.url}</p>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${scraper.metadata?.active ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-400'}`}>
                    {scraper.metadata?.active ? 'Actif' : 'Inactif'}
                  </span>
                  
                  {scraper.metadata?.total_runs !== undefined && (
                    <span className="text-xs text-gray-400">
                      {scraper.metadata.total_runs} runs
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/scrapers/${scraper.slug}`}
                    className="btn-primary flex-1 text-center"
                  >
                    Voir
                  </Link>
                  <Link 
                    href={`/scrapers/${scraper.slug}/edit`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:text-blue-400">
            ← Retour au Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}