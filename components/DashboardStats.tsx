export default function DashboardStats({ stats }: { 
  stats: {
    totalScrapers: number;
    activeScrapers: number;
    totalRuns: number;
    successRate: number;
  }
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card">
        <div className="text-gray-400 text-sm mb-2">Total Scrapers</div>
        <div className="text-3xl font-bold">{stats.totalScrapers}</div>
      </div>
      
      <div className="card">
        <div className="text-gray-400 text-sm mb-2">Scrapers Actifs</div>
        <div className="text-3xl font-bold text-success">{stats.activeScrapers}</div>
      </div>
      
      <div className="card">
        <div className="text-gray-400 text-sm mb-2">Total Exécutions</div>
        <div className="text-3xl font-bold">{stats.totalRuns}</div>
      </div>
      
      <div className="card">
        <div className="text-gray-400 text-sm mb-2">Taux de Succès</div>
        <div className="text-3xl font-bold text-primary">{stats.successRate}%</div>
      </div>
    </div>
  )
}