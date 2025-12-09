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
    
    const startTime = Date.now()
    
    try {
      // Validate and parse selectors
      const selectors = validateSelectors(scraper.metadata?.selectors || '{}')
      
      // Execute scraping
      const scrapedData = await executeScraping({
        url: scraper.metadata?.url || '',
        selectors,
      })
      
      const executionTime = Date.now() - startTime
      
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
      
      return NextResponse.json({
        success: true,
        data: scrapedData,
        executionTime,
        itemsCount: scrapedData.length,
      })
      
    } catch (scrapingError) {
      const executionTime = Date.now() - startTime
      const errorMessage = scrapingError instanceof Error ? scrapingError.message : 'Unknown error'
      
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
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}