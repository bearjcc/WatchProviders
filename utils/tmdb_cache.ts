/// <reference lib="deno.unstable" />
import { load } from "jsr:@std/dotenv";

// Load environment variables
const env = await load({ envPath: ".env" });
const TMDB_API_KEY = env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("Missing TMDB_API_KEY in .env");
  Deno.exit(1);
}

// Types for TMDB responses
interface TMDBProvider {
  provider_name: string;
  logo_path: string;
}

interface TMDBProviderResponse {
  results?: {
    US?: {
      flatrate?: TMDBProvider[];
    };
  };
}

interface TMDBTVSearchResult {
  id: number;
  name: string;
  first_air_date?: string;
}

interface TMDBTVSearchResponse {
  results: TMDBTVSearchResult[];
}

// Cache entry type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache TTL in milliseconds (7 days)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

export class TMDBCache {
  private kv: Deno.Kv;
  private initialized = false;

  constructor() {
    this.kv = {} as Deno.Kv; // Will be initialized in init()
  }

  async init() {
    if (!this.initialized) {
      this.kv = await Deno.openKv();
      this.initialized = true;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Helper method to check if cache entry is expired
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_TTL;
  }

  // Movie providers
  async getMovieProviders(movieId: number): Promise<TMDBProvider[]> {
    await this.ensureInitialized();
    
    // Try to get from cache first
    const cacheKey = ["movie_providers", movieId];
    const cached = await this.kv.get<CacheEntry<TMDBProvider[]>>(cacheKey);
    
    if (cached.value && !this.isExpired(cached.value.timestamp)) {
      return cached.value.data;
    }

    // If not in cache or expired, fetch from TMDB
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch movie providers: ${response.statusText}`);
      }

      const data: TMDBProviderResponse = await response.json();
      const providers = data.results?.US?.flatrate || [];

      // Cache the result
      const entry: CacheEntry<TMDBProvider[]> = { data: providers, timestamp: Date.now() };
      await this.kv.set(cacheKey, entry);

      return providers;
    } catch (error) {
      console.error(`Error fetching movie providers: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  // TV providers
  async getTVProviders(tvId: number): Promise<TMDBProvider[]> {
    await this.ensureInitialized();
    
    // Try to get from cache first
    const cacheKey = ["tv_providers", tvId];
    const cached = await this.kv.get<CacheEntry<TMDBProvider[]>>(cacheKey);
    
    if (cached.value && !this.isExpired(cached.value.timestamp)) {
      return cached.value.data;
    }

    // If not in cache or expired, fetch from TMDB
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${tvId}/watch/providers?api_key=${TMDB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch TV providers: ${response.statusText}`);
      }

      const data: TMDBProviderResponse = await response.json();
      const providers = data.results?.US?.flatrate || [];

      // Cache the result
      const entry: CacheEntry<TMDBProvider[]> = { data: providers, timestamp: Date.now() };
      await this.kv.set(cacheKey, entry);

      return providers;
    } catch (error) {
      console.error(`Error fetching TV providers: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  // TV show search
  async searchTVShow(title: string, year?: string): Promise<number | null> {
    await this.ensureInitialized();
    
    // Try to get from cache first
    const cacheKey = ["tv_search", title, year || ""];
    const cached = await this.kv.get<CacheEntry<number | null>>(cacheKey);
    
    if (cached.value && !this.isExpired(cached.value.timestamp)) {
      return cached.value.data;
    }

    // If not in cache or expired, fetch from TMDB
    try {
      const query = encodeURIComponent(title);
      const yearFilter = year && !isNaN(parseInt(year)) ? `&first_air_date_year=${year}` : '';
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}${yearFilter}`
      );

      if (!response.ok) {
        throw new Error(`Failed to search TV show: ${response.statusText}`);
      }

      const data: TMDBTVSearchResponse = await response.json();
      const tvId = data.results && data.results.length > 0 ? data.results[0].id : null;

      // Cache the result
      const entry: CacheEntry<number | null> = { data: tvId, timestamp: Date.now() };
      await this.kv.set(cacheKey, entry);

      return tvId;
    } catch (error) {
      console.error(`Error searching TV show: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  // Clear all cache entries
  async clearCache(): Promise<void> {
    await this.ensureInitialized();
    
    // Iterate through all entries and delete them
    const entries = this.kv.list({ prefix: [] });
    for await (const entry of entries) {
      await this.kv.delete(entry.key);
    }
    
    console.log("Cache cleared successfully");
  }

  // Refresh all cache entries
  async refreshCache(): Promise<void> {
    await this.ensureInitialized();
    
    // Get all entries
    const entries = this.kv.list({ prefix: [] });
    
    for await (const entry of entries) {
      const [type, id] = entry.key;
      const value = entry.value as CacheEntry<unknown>;
      
      // Skip if entry is not expired
      if (!this.isExpired(value.timestamp)) {
        continue;
      }
      
      // Refresh based on entry type
      if (type === "movie_providers") {
        await this.getMovieProviders(id as number);
      } else if (type === "tv_providers") {
        await this.getTVProviders(id as number);
      } else if (type === "tv_search") {
        const [_, title, year] = entry.key;
        await this.searchTVShow(title as string, year as string);
      }
    }
    
    console.log("Cache refresh completed");
  }
}

// Export singleton instance
export const tmdbCache = new TMDBCache(); 