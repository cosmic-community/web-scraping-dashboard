import axios from 'axios'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import type { ScrapedItem } from '@/types'

export interface ScraperOptions {
  url: string;
  selectors: Record<string, string>;
  timeout?: number;
  usePuppeteer?: boolean;
}

/**
 * Execute scraping using Puppeteer (for dynamic JavaScript sites)
 */
async function scrapeWithPuppeteer(options: ScraperOptions): Promise<ScrapedItem[]> {
  const { url, selectors, timeout = 30000 } = options;
  
  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout 
    });

    // Wait a bit for any lazy-loaded content
    await page.waitForTimeout(2000);

    // Get the HTML content after JavaScript execution
    const html = await page.content();
    
    // Parse with Cheerio
    const $ = cheerio.load(html);
    const results: ScrapedItem[] = [];
    
    // Find all items
    const containerSelector = selectors['container'] || 'body';
    const $items = $(containerSelector);
    
    if ($items.length === 0) {
      // If no container found, try to scrape single item
      const item: ScrapedItem = {};
      
      Object.entries(selectors).forEach(([key, selector]) => {
        if (key !== 'container') {
          const value = $(selector).first().text().trim();
          item[key] = value || null;
        }
      });
      
      if (Object.keys(item).length > 0) {
        results.push(item);
      }
    } else {
      // Scrape multiple items
      $items.each((_, element) => {
        const $item = $(element);
        const item: ScrapedItem = {};
        
        Object.entries(selectors).forEach(([key, selector]) => {
          if (key !== 'container') {
            const value = $item.find(selector).first().text().trim();
            item[key] = value || null;
          }
        });
        
        if (Object.keys(item).length > 0) {
          results.push(item);
        }
      });
    }
    
    return results;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Execute scraping using Axios + Cheerio (for static HTML sites)
 */
async function scrapeWithCheerio(options: ScraperOptions): Promise<ScrapedItem[]> {
  const { url, selectors, timeout = 30000 } = options;
  
  // Fetch the page
  const response = await axios.get(url, {
    timeout,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  
  // Parse with Cheerio
  const $ = cheerio.load(response.data);
  const results: ScrapedItem[] = [];
  
  // Find all items (assuming a common container)
  const containerSelector = selectors['container'] || 'body';
  const $items = $(containerSelector);
  
  if ($items.length === 0) {
    // If no container found, try to scrape single item
    const item: ScrapedItem = {};
    
    Object.entries(selectors).forEach(([key, selector]) => {
      if (key !== 'container') {
        const value = $(selector).first().text().trim();
        item[key] = value || null;
      }
    });
    
    if (Object.keys(item).length > 0) {
      results.push(item);
    }
  } else {
    // Scrape multiple items
    $items.each((_, element) => {
      const $item = $(element);
      const item: ScrapedItem = {};
      
      Object.entries(selectors).forEach(([key, selector]) => {
        if (key !== 'container') {
          const value = $item.find(selector).first().text().trim();
          item[key] = value || null;
        }
      });
      
      if (Object.keys(item).length > 0) {
        results.push(item);
      }
    });
  }
  
  return results;
}

/**
 * Main scraping function - automatically detects if Puppeteer is needed
 */
export async function executeScraping(options: ScraperOptions): Promise<ScrapedItem[]> {
  try {
    // First, try with Cheerio (faster for static sites)
    if (!options.usePuppeteer) {
      try {
        const results = await scrapeWithCheerio(options);
        // If we got results, great!
        if (results.length > 0) {
          return results;
        }
        // If no results, fall through to try Puppeteer
      } catch (error) {
        console.log('Cheerio scraping failed, falling back to Puppeteer...');
      }
    }
    
    // Use Puppeteer for JavaScript-heavy sites
    return await scrapeWithPuppeteer(options);
    
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape ${options.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateSelectors(selectors: string): Record<string, string> {
  try {
    const parsed = JSON.parse(selectors);
    
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Selectors must be an object');
    }
    
    return parsed as Record<string, string>;
  } catch (error) {
    throw new Error('Invalid selectors JSON format');
  }
}