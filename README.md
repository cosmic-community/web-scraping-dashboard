# 🕷️ Web Scraping Dashboard

![Web Scraping Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=300&fit=crop&auto=format)

Une plateforme complète de web scraping construite avec Next.js 16 et Cosmic CMS. Cette application permet de configurer, exécuter et gérer des tâches de scraping de sites web avec une interface intuitive et des capacités d'analyse avancées.

## ✨ Features

- 🎯 **Configuration de Scrapers**: Interface visuelle pour créer des configurations de scraping personnalisées
- ⚡ **Exécution en Temps Réel**: Lancement de tâches de scraping avec feedback instantané
- 📊 **Dashboard Analytique**: Visualisation des statistiques et performances de scraping
- 💾 **Stockage Intelligent**: Sauvegarde automatique des résultats dans Cosmic CMS
- 🔄 **Gestion d'Erreurs**: Système de retry automatique et logging détaillé
- 📥 **Export de Données**: Export des résultats en JSON, CSV, ou Excel
- 🔔 **Notifications**: Alertes pour succès, échecs et erreurs
- 🎨 **Interface Moderne**: Design responsive avec Tailwind CSS

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=6937f2ff8880fbd1d8a5ccdd&clone_repository=6937f4c88880fbd1d8a5cd13)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "Create a content model for a blog with posts, authors, and categoriesJe veux créer un logiciel de S strapping de site."

### Code Generation Prompt

> "Je veux créer une application qui scrape lles sites."

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **CMS**: Cosmic
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Runtime**: Bun
- **Scraping**: Cheerio, Axios
- **Data Export**: Papa Parse (CSV)

## 🚀 Getting Started

### Prerequisites

- Bun installed on your machine
- A Cosmic account and bucket
- Node.js 18+ (for compatibility)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd web-scraping-dashboard
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your Cosmic credentials:
```env
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
```

4. Run the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Cosmic SDK Examples

### Fetching Scraper Configurations

```typescript
import { cosmic } from '@/lib/cosmic'

const { objects: scrapers } = await cosmic.objects
  .find({ type: 'scrapers' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1)
```

### Creating a Scraping Result

```typescript
await cosmic.objects.insertOne({
  title: `Scraping Result - ${new Date().toISOString()}`,
  type: 'scraping-results',
  metadata: {
    scraper_id: scraperId,
    data: JSON.stringify(scrapedData),
    status: 'Success',
    items_count: scrapedData.length,
    execution_time: executionTime,
    timestamp: new Date().toISOString()
  }
})
```

### Updating Scraper Statistics

```typescript
await cosmic.objects.updateOne(scraperId, {
  metadata: {
    last_run: new Date().toISOString(),
    total_runs: totalRuns + 1,
    success_rate: calculateSuccessRate()
  }
})
```

## 🌐 Cosmic CMS Integration

This application is deeply integrated with Cosmic CMS:

### Content Types

1. **Scrapers**: Configuration des scrapers
   - URL cible
   - Sélecteurs CSS
   - Fréquence d'exécution
   - Options de scraping

2. **Scraping Results**: Résultats de scraping
   - Données extraites
   - Timestamp d'exécution
   - Statut (Success/Failed)
   - Nombre d'items

3. **Execution Logs**: Historique d'exécution
   - Détails de l'exécution
   - Erreurs rencontrées
   - Temps d'exécution
   - Messages de debug

### Data Flow

1. **Configuration**: Les utilisateurs créent des configurations de scraper dans l'interface
2. **Exécution**: Les scrapers sont exécutés via API routes Next.js
3. **Stockage**: Les résultats sont automatiquement sauvegardés dans Cosmic
4. **Visualisation**: Le dashboard affiche les statistiques et résultats en temps réel

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables:
   - `COSMIC_BUCKET_SLUG`
   - `COSMIC_READ_KEY`
   - `COSMIC_WRITE_KEY`
4. Deploy

### Environment Variables

Make sure to set these in your deployment platform:

```env
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
```

## 📖 Documentation

For more information about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Cosmic Documentation](https://www.cosmicjs.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ using [Cosmic](https://www.cosmicjs.com?utm_source=bucket_web_scraping&utm_medium=referral&utm_campaign=app_badge&utm_content=built_with_cosmic)

<!-- README_END -->