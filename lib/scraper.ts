import axios from 'axios'
import * as cheerio from 'cheerio'
import type { ScrapedItem } from '@/types'

export interface ScraperOptions {
  url: string;
  selectors: Record<string, string>;
  timeout?: number;
}

export async function executeScraping(options: ScraperOptions): Promise<ScrapedItem[]> {
  const { url, selectors, timeout = 30000 } = options;
  
  try {
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
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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