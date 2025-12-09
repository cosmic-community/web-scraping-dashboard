// Base Cosmic object interface
export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Scraper configuration
export interface Scraper extends CosmicObject {
  type: 'scrapers';
  metadata: {
    url: string;
    selectors: string;
    frequency?: string;
    active?: boolean;
    last_run?: string;
    total_runs?: number;
    success_rate?: number;
    description?: string;
  };
}

// Scraping result
export interface ScrapingResult extends CosmicObject {
  type: 'scraping-results';
  metadata: {
    scraper_id: string;
    data: string;
    status: 'Success' | 'Failed';
    items_count?: number;
    execution_time?: number;
    timestamp: string;
    error_message?: string;
  };
}

// Execution log
export interface ExecutionLog extends CosmicObject {
  type: 'execution-logs';
  metadata: {
    scraper_id: string;
    status: 'Success' | 'Failed' | 'Running';
    execution_time?: number;
    items_scraped?: number;
    error_message?: string;
    timestamp: string;
  };
}

// Scraped data item
export interface ScrapedItem {
  [key: string]: string | number | boolean | null;
}

// Dashboard statistics
export interface DashboardStats {
  totalScrapers: number;
  activeScrapers: number;
  totalRuns: number;
  successRate: number;
  recentResults: ScrapingResult[];
  topScrapers: Scraper[];
}

// API response types
export interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Scraping execution response
export interface ScrapingExecutionResponse {
  success: boolean;
  data?: ScrapedItem[];
  error?: string;
  executionTime?: number;
  itemsCount?: number;
}