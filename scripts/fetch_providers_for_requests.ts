import { load } from "jsr:@std/dotenv";
import { MovieRequest, TVRequest } from "../types/Request.d.ts";
import { APICache } from "../utils/cache.ts";

// Define watch provider type
interface WatchProvider {
  name: string;
  logo: string;
}

// Load environment variables
const env = await load({ envPath: ".env" });
const TMDB_API_KEY = env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("Missing TMDB_API_KEY in .env");
  Deno.exit(1);
}

const cache = new APICache();
await cache.init();

async function fetchMovieProviders(movieId: number): Promise<WatchProvider[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch movie providers: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const usProviders = data.results?.US?.flatrate || [];
    
    return usProviders.map((provider: { provider_name: string; logo_path: string }) => ({
      name: provider.provider_name,
      logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`
    }));
  } catch (error) {
    console.error(`Error fetching movie providers: ${(error as Error).message}`);
    return [];
  }
}

async function fetchTVProviders(tvId: number): Promise<WatchProvider[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/watch/providers?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch TV providers: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const usProviders = data.results?.US?.flatrate || [];
    
    return usProviders.map((provider: { provider_name: string; logo_path: string }) => ({
      name: provider.provider_name,
      logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`
    }));
  } catch (error) {
    console.error(`Error fetching TV providers: ${(error as Error).message}`);
    return [];
  }
}

async function getProviders(year: string): Promise<MediaProvider[]> {
  const cacheKey = ["tvdb", "providers", year];
  
  // Try cache first
  const cached = await cache.get<MediaProvider[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from API
  const providers = await fetchProvidersFromTVDB(year);
  
  // Store in cache
  await cache.set(cacheKey, providers);

  return providers;
}

// Main function to demonstrate functionality
async function main() {
  // Example movie IDs
  const movieIds = [550, 155, 680];
  
  // Example TV show IDs
  const tvIds = [1399, 60574, 66732];

  console.log("Fetching movie providers...");
  for (const id of movieIds) {
    const providers = await fetchMovieProviders(id);
    console.log(`Movie ID ${id} providers:`);
    providers.forEach(p => console.log(`- ${p.name}`));
  }

  console.log("\nFetching TV show providers...");
  for (const id of tvIds) {
    const providers = await fetchTVProviders(id);
    console.log(`TV Show ID ${id} providers:`);
    providers.forEach(p => console.log(`- ${p.name}`));
  }
}

// Run main if this is the main module
if (import.meta.main) {
  await main();
}

// Export main functions
export { fetchMovieProviders, fetchTVProviders };
export type { WatchProvider };

// run the script i
