import { cosmic, hasStatus } from '@/lib/cosmic'
import type { Scraper, ScrapingResult } from '@/types'
import DashboardStats from '@/components/DashboardStats'
import ScraperList from '@/components/ScraperList'
import RecentResults from '@/components/RecentResults'

async function getDashboardData() {
  try {
    // Fetch scrapers
    const scrapersResponse = await cosmic.objects
      .find({ type: 'scrapers' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    const scrapers = scrapersResponse.objects as Scraper[];
    
    // Fetch recent results
    const resultsResponse = await cosmic.objects
      .find({ type: 'scraping-results' })
      .props(['id', 'title', 'metadata'])
      .depth(1);
    
    const results = resultsResponse.objects as ScrapingResult[];
    
    // Sort results by timestamp
    const sortedResults = results.sort((a, b) => {
      const dateA = new Date(a.metadata?.timestamp || '').getTime();
      const dateB = new Date(b.metadata?.timestamp || '').getTime();
      return dateB - dateA;
    });
    
    // Calculate statistics
    const activeScrapers = scrapers.filter(s => s.metadata?.active).length;
    const totalRuns = scrapers.reduce((sum, s) => sum + (s.metadata?.total_runs || 0), 0);
    const successfulRuns = results.filter(r => r.metadata?.status === 'Success').length;
    const successRate = results.length > 0 ? (successfulRuns / results.length) * 100 : 0;
    
    return {
      scrapers,
      recentResults: sortedResults.slice(0, 10),
      stats: {
        totalScrapers: scrapers.length,
        activeScrapers,
        totalRuns,
        successRate: Math.round(successRate),
      },
    };
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return {
        scrapers: [],
        recentResults: [],
        stats: {
          totalScrapers: 0,
          activeScrapers: 0,
          totalRuns: 0,
          successRate: 0,
        },
      };
    }
    throw error;
  }
}

export default async function HomePage() {
  const data = await getDashboardData();
  
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🕷️ Web Scraping Dashboard</h1>
          <p className="text-gray-400 mt-2">Gérez vos scrapers et visualisez vos résultats</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <DashboardStats stats={data.stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Scrapers Actifs</h2>
            <ScraperList scrapers={data.scrapers} />
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Résultats Récents</h2>
            <RecentResults results={data.recentResults} />
          </section>
        </div>
      </main>
    </div>
  )
}