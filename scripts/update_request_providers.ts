import { load } from "jsr:@std/dotenv";
import { MovieRequest, TVRequest } from "../types/Request.d.ts";
import { MediaProvider } from "../types/mediaProviders.ts";
import { fetchMovieRequests, fetchTVRequests } from "./fetch_ombi_requests.ts";
import { tmdbCache } from "../utils/tmdb_cache.ts";

// Load environment variables
const env = await load({ envPath: ".env" });
const TMDB_API_KEY = env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("Missing TMDB_API_KEY in .env");
  Deno.exit(1);
}

async function fetchTMDBMovieProviders(movieId: number): Promise<{ provider_name: string; logo_path: string }[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch movie providers: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.results?.US?.flatrate || [];
  } catch (error) {
    console.error(`Error fetching movie providers: ${(error as Error).message}`);
    return [];
  }
}

async function searchTMDBForTVShow(title: string, year?: string): Promise<number | null> {
  try {
    const query = encodeURIComponent(title);
    const yearFilter = year && !isNaN(parseInt(year)) ? `&first_air_date_year=${year}` : '';
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}${yearFilter}`
    );

    if (!response.ok) {
      console.error(`Failed to search TV show: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    }
    return null;
  } catch (error) {
    console.error(`Error searching TV show: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function fetchTMDBTVProviders(tvId: number): Promise<{ provider_name: string; logo_path: string }[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/watch/providers?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch TV providers: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.results?.US?.flatrate || [];
  } catch (error) {
    console.error(`Error fetching TV providers: ${(error as Error).message}`);
    return [];
  }
}

export async function updateMovieRequestProviders(requests: MovieRequest[]): Promise<void> {
  for (const request of requests) {
    const tmdbProviders = await tmdbCache.getMovieProviders(request.theMovieDbId);
    const mediaProviders = MediaProvider.fromTMDBProviders(tmdbProviders);
    request.mediaProviders = mediaProviders.map(p => p.streamFabModule);
  }
}

export async function updateTVRequestProviders(requests: TVRequest[]): Promise<void> {
  for (const request of requests) {
    const year = request.releaseDate?.split("-")[0];
    const tmdbId = await tmdbCache.searchTVShow(request.title || "", year);
    if (tmdbId) {
      const tmdbProviders = await tmdbCache.getTVProviders(tmdbId);
      const mediaProviders = MediaProvider.fromTMDBProviders(tmdbProviders);
      request.mediaProviders = mediaProviders.map(p => p.streamFabModule);
    }
  }
}

// Helper function to format providers for display
function formatProviders(providers: string[] | undefined): string {
  if (!providers || providers.length === 0) return "No streaming providers";
  return providers.join(", ");
}

// Main functions to run when script is called directly
async function processMovieRequiders() {
  console.log("Fetching and updating movie request providers...");
  const movieRequests = await fetchMovieRequests();
  await updateMovieRequestProviders(movieRequests);
  
  console.log(`\nProcessed ${movieRequests.length} movie requests:`);
  for (const movie of movieRequests) {
    console.log(`${movie.title} (${movie.releaseDate?.split("-")[0]}) - Available on: ${formatProviders(movie.mediaProviders)}`);
  }
}

async function processTVProviders() {
  console.log("Fetching and updating TV request providers...");
  const tvRequests = await fetchTVRequests();
  await updateTVRequestProviders(tvRequests);
  
  console.log(`\nProcessed ${tvRequests.length} TV requests:`);
  for (const tv of tvRequests) {
    console.log(`${tv.title} (${tv.releaseDate?.split("-")[0]}) - Available on: ${formatProviders(tv.mediaProviders)}`);
  }
}

// Run main if this is the main module
if (import.meta.main) {
  const args = Deno.args;
  if (args.includes("--movies")) {
    await processMovieRequiders();
  } else if (args.includes("--tv")) {
    await processTVProviders();
  } else {
    console.log("Please specify --movies or --tv");
  }
} 