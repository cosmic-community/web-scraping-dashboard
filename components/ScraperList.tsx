import type { Scraper } from '@/types'
import Link from 'next/link'

export default function ScraperList({ scrapers }: { scrapers: Scraper[] }) {
  if (!scrapers || scrapers.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 mb-4">Aucun scraper configuré</p>
        <Link href="/scrapers/new" className="btn-primary inline-block">
          Créer un Scraper
        </Link>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {scrapers.map((scraper) => (
        <div key={scraper.id} className="card hover:border-primary transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{scraper.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{scraper.metadata?.url}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-2 py-1 rounded ${scraper.metadata?.active ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-400'}`}>
                  {scraper.metadata?.active ? 'Actif' : 'Inactif'}
                </span>
                
                {scraper.metadata?.total_runs !== undefined && (
                  <span className="text-gray-400">
                    {scraper.metadata.total_runs} exécutions
                  </span>
                )}
                
                {scraper.metadata?.success_rate !== undefined && (
                  <span className="text-gray-400">
                    {scraper.metadata.success_rate}% succès
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link 
                href={`/scrapers/${scraper.slug}`}
                className="text-primary hover:text-blue-400 text-sm"
              >
                Voir
              </Link>
              <Link 
                href={`/scrapers/${scraper.slug}/edit`}
                className="text-gray-400 hover:text-white text-sm"
              >
                Modifier
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      <Link href="/scrapers/new" className="btn-primary w-full block text-center mt-4">
        + Créer un Nouveau Scraper
      </Link>
    </div>
  )
}