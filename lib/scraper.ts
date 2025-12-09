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
  const { url, selectors, timeout = 60000 } = options; // Changed: Increased timeout to 60s
  
  let browser;
  try {
    console.log(`🚀 Launching Puppeteer for ${url}`);
    
    // Launch headless browser with enhanced anti-detection
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security', // Changed: Added for CORS issues
        '--disable-features=IsolateOrigins,site-per-process', // Changed: Better compatibility
        '--window-size=1920,1080' // Changed: Set viewport size
      ]
    });

    const page = await browser.newPage();
    
    // Changed: Enhanced user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Changed: Set extra headers to avoid bot detection
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    console.log(`📡 Navigating to ${url}`);
    
    // Navigate to the page with extended timeout
    await page.goto(url, { 
      waitUntil: 'networkidle0', // Changed: Wait for network to be completely idle
      timeout 
    });

    console.log(`⏳ Waiting for content to load...`);
    
    // Changed: Wait longer for JavaScript content to render
    await page.waitForTimeout(5000); // 5 seconds wait
    
    // Changed: Try to wait for common content indicators
    try {
      await page.waitForSelector('body', { timeout: 5000 });
    } catch (e) {
      console.log('⚠️ Timeout waiting for body selector, continuing anyway...');
    }

    // Get the HTML content after JavaScript execution
    const html = await page.content();
    console.log(`📄 HTML content length: ${html.length} characters`);
    
    // Parse with Cheerio
    const $ = cheerio.load(html);
    const results: ScrapedItem[] = [];
    
    // Find all items
    const containerSelector = selectors['container'] || 'body';
    console.log(`🔍 Looking for container: ${containerSelector}`);
    
    const $items = $(containerSelector);
    console.log(`✅ Found ${$items.length} container(s)`);
    
    if ($items.length === 0) {
      // If no container found, try to scrape single item
      console.log(`ℹ️ No container found, trying single item scraping`);
      const item: ScrapedItem = {};
      
      Object.entries(selectors).forEach(([key, selector]) => {
        if (key !== 'container') {
          const $element = $(selector).first();
          const value = $element.text().trim();
          console.log(`  - ${key} (${selector}): "${value}"`);
          item[key] = value || null;
        }
      });
      
      if (Object.keys(item).length > 0) {
        results.push(item);
      }
    } else {
      // Scrape multiple items
      console.log(`📦 Scraping ${$items.length} items`);
      
      $items.each((index, element) => {
        const $item = $(element);
        const item: ScrapedItem = {};
        
        Object.entries(selectors).forEach(([key, selector]) => {
          if (key !== 'container') {
            const value = $item.find(selector).first().text().trim();
            item[key] = value || null;
          }
        });
        
        if (Object.keys(item).length > 0) {
          console.log(`  Item ${index + 1}:`, item);
          results.push(item);
        }
      });
    }
    
    console.log(`✅ Successfully scraped ${results.length} items`);
    return results;
    
  } catch (error) {
    console.error('❌ Puppeteer scraping error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log(`🔒 Browser closed`);
    }
  }
}

/**
 * Execute scraping using Axios + Cheerio (for static HTML sites)
 */
async function scrapeWithCheerio(options: ScraperOptions): Promise<ScrapedItem[]> {
  const { url, selectors, timeout = 30000 } = options;
  
  console.log(`🌐 Fetching ${url} with Cheerio`);
  
  // Fetch the page
  const response = await axios.get(url, {
    timeout,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
    },
  });
  
  console.log(`📄 Response status: ${response.status}, content length: ${response.data.length}`);
  
  // Parse with Cheerio
  const $ = cheerio.load(response.data);
  const results: ScrapedItem[] = [];
  
  // Find all items (assuming a common container)
  const containerSelector = selectors['container'] || 'body';
  console.log(`🔍 Looking for container: ${containerSelector}`);
  
  const $items = $(containerSelector);
  console.log(`✅ Found ${$items.length} container(s)`);
  
  if ($items.length === 0) {
    // If no container found, try to scrape single item
    console.log(`ℹ️ No container found, trying single item scraping`);
    const item: ScrapedItem = {};
    
    Object.entries(selectors).forEach(([key, selector]) => {
      if (key !== 'container') {
        const value = $(selector).first().text().trim();
        console.log(`  - ${key} (${selector}): "${value}"`);
        item[key] = value || null;
      }
    });
    
    if (Object.keys(item).length > 0) {
      results.push(item);
    }
  } else {
    // Scrape multiple items
    console.log(`📦 Scraping ${$items.length} items`);
    
    $items.each((index, element) => {
      const $item = $(element);
      const item: ScrapedItem = {};
      
      Object.entries(selectors).forEach(([key, selector]) => {
        if (key !== 'container') {
          const value = $item.find(selector).first().text().trim();
          item[key] = value || null;
        }
      });
      
      if (Object.keys(item).length > 0) {
        console.log(`  Item ${index + 1}:`, item);
        results.push(item);
      }
    });
  }
  
  console.log(`✅ Successfully scraped ${results.length} items`);
  return results;
}

/**
 * Main scraping function - automatically detects if Puppeteer is needed
 */
export async function executeScraping(options: ScraperOptions): Promise<ScrapedItem[]> {
  try {
    console.log(`\n🕷️ Starting scraping process for: ${options.url}`);
    console.log(`⚙️ Use Puppeteer: ${options.usePuppeteer ? 'Yes' : 'No (trying Cheerio first)'}`);
    console.log(`🎯 Selectors:`, options.selectors);
    
    // First, try with Cheerio (faster for static sites)
    if (!options.usePuppeteer) {
      try {
        const results = await scrapeWithCheerio(options);
        // If we got results, great!
        if (results.length > 0) {
          console.log(`✅ Cheerio scraping successful!`);
          return results;
        }
        // If no results, fall through to try Puppeteer
        console.log(`⚠️ Cheerio returned no results, falling back to Puppeteer...`);
      } catch (error) {
        console.log(`⚠️ Cheerio scraping failed, falling back to Puppeteer...`);
        console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Use Puppeteer for JavaScript-heavy sites
    console.log(`🚀 Using Puppeteer for JavaScript rendering...`);
    return await scrapeWithPuppeteer(options);
    
  } catch (error) {
    console.error('❌ Scraping error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to scrape ${options.url}: ${errorMessage}`);
  }
}

export function validateSelectors(selectors: string): Record<string, string> {
  try {
    const parsed = JSON.parse(selectors);
    
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Selectors must be an object');
    }
    
    console.log(`✅ Selectors validated:`, parsed);
    return parsed as Record<string, string>;
  } catch (error) {
    console.error(`❌ Invalid selectors format:`, error);
    throw new Error('Invalid selectors JSON format');
  }
}