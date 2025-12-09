import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { executeScraping, validateSelectors } from '@/lib/scraper'
import type { Scraper } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scraperId } = body
    
    if (!scraperId) {
      return NextResponse.json(
        { error: 'Scraper ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`\n🔵 API: Received scraping request for scraper ID: ${scraperId}`);
    
    // Fetch scraper configuration
    const scraperResponse = await cosmic.objects.findOne({
      type: 'scrapers',
      id: scraperId,
    }).depth(1)
    
    const scraper = scraperResponse.object as Scraper
    
    if (!scraper) {
      return NextResponse.json(
        { error: 'Scraper not found' },
        { status: 404 }
      )
    }
    
    console.log(`📋 Scraper found: ${scraper.title}`);
    console.log(`🌐 URL: ${scraper.metadata?.url}`);
    console.log(`🚀 Use Puppeteer: ${scraper.metadata?.use_puppeteer}`);
    
    const startTime = Date.now()
    
    try {
      // Validate and parse selectors
      const selectors = validateSelectors(scraper.metadata?.selectors || '{}')
      
      // Execute scraping with Puppeteer flag if specified
      const scrapedData = await executeScraping({
        url: scraper.metadata?.url || '',
        selectors,
        usePuppeteer: scraper.metadata?.use_puppeteer || false,
        timeout: 60000 // Changed: 60 second timeout for complex sites
      })
      
      const executionTime = Date.now() - startTime
      
      console.log(`✅ Scraping completed in ${executionTime}ms`);
      console.log(`📊 Items scraped: ${scrapedData.length}`);
      
      // Save result to Cosmic
      await cosmic.objects.insertOne({
        title: `Result: ${scraper.title} - ${new Date().toISOString()}`,
        type: 'scraping-results',
        metadata: {
          scraper_id: scraperId,
          data: JSON.stringify(scrapedData),
          status: 'Success',
          items_count: scrapedData.length,
          execution_time: executionTime,
          timestamp: new Date().toISOString(),
          scraping_method: scraper.metadata?.use_puppeteer ? 'puppeteer' : 'cheerio',
        },
      })
      
      // Update scraper statistics
      const totalRuns = (scraper.metadata?.total_runs || 0) + 1
      await cosmic.objects.updateOne(scraperId, {
        metadata: {
          last_run: new Date().toISOString(),
          total_runs: totalRuns,
        },
      })
      
      console.log(`💾 Results saved to Cosmic`);
      
      return NextResponse.json({
        success: true,
        data: scrapedData,
        executionTime,
        itemsCount: scrapedData.length,
      })
      
    } catch (scrapingError) {
      const executionTime = Date.now() - startTime
      const errorMessage = scrapingError instanceof Error ? scrapingError.message : 'Unknown error'
      
      console.error(`❌ Scraping failed: ${errorMessage}`);
      
      // Save error result
      await cosmic.objects.insertOne({
        title: `Error: ${scraper.title} - ${new Date().toISOString()}`,
        type: 'scraping-results',
        metadata: {
          scraper_id: scraperId,
          data: '[]',
          status: 'Failed',
          items_count: 0,
          execution_time: executionTime,
          timestamp: new Date().toISOString(),
          error_message: errorMessage,
        },
      })
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
    
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json(
        { error: 'Scraper not found' },
        { status: 404 }
      )
    }
    
    console.error(`❌ API Error:`, error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}