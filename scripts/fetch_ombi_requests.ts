import { load } from "jsr:@std/dotenv";
import { MovieRequest, TVRequest } from "../types/Request.d.ts";
import { fetchMovieProviders, fetchTVProviders, WatchProvider } from "./fetch_providers_for_requests.ts";

// Load environment variables
const env = await load({ envPath: ".env" });
const OMBI_API_KEY = env.OMBI_API_KEY;
const TMDB_API_KEY = env.TMDB_API_KEY;
const OMBI_BASE_URL = env.OMBI_BASE_URL || "http://localhost:5000";

if (!OMBI_API_KEY || !TMDB_API_KEY) {
  console.error(
    "Missing API keys. Ensure OMBI_API_KEY and TMDB_API_KEY are set in .env.local.",
  );
  Deno.exit(1);
}

// TODO: Add TVDB API integration for more accurate TV show information
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

async function fetchRequests<T>(
  type: "movie" | "tv",
  filterFn: (req: T) => boolean,
): Promise<T[]> {
  const endpoint = `${OMBI_BASE_URL}/api/v1/Request/${type}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "ApiKey": OMBI_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${type} requests: ${response.statusText}`);
      return [];
    }

    const requests: T[] = await response.json();
    return requests.filter(filterFn);
  } catch (error: unknown) {
    console.error(`Error fetching ${type} requests: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

async function fetchMovieRequests(): Promise<MovieRequest[]> {
  return await fetchRequests<MovieRequest>(
    "movie",
    (req) =>
      req.available === false && req.releaseDate != null &&
      new Date(req.releaseDate) <= new Date(),
  );
}

async function fetchTVRequests(): Promise<TVRequest[]> {
  return await fetchRequests<TVRequest>("tv", (req) =>
    req.childRequests &&
    req.childRequests.some((child) =>
      child.seasonRequests.some((season) =>
        season.episodes.some((episode) => !episode.available)
      )
    ));
}

// Helper function to format providers
function formatProviders(providers: WatchProvider[]): string {
  if (providers.length === 0) return "No streaming providers";
  return providers.map(p => p.name).join(", ");
}

// Function to process and display movie requests
async function processMovieRequests() {
  console.log("Fetching movie requests...");
  const movieRequests = await fetchMovieRequests();

  for (const movie of movieRequests) {
    const providers = await fetchMovieProviders(movie.theMovieDbId);
    console.log(`${movie.title} (${movie.releaseDate?.split("-")[0]}) - Available on: ${formatProviders(providers)}`);
  }
}

// Function to process and display TV requests
async function processTVRequests() {
  console.log("Fetching TV requests...");
  const tvRequests = await fetchTVRequests();

  for (const tv of tvRequests) {
    const year = tv.releaseDate?.split("-")[0];
    const tmdbId = await searchTMDBForTVShow(tv.title || "", year);
    if (tmdbId) {
      const providers = await fetchTVProviders(tmdbId);
      console.log(`${tv.title} (${year}) - Available on: ${formatProviders(providers)}`);
    } else {
      console.log(`${tv.title} (${year}) - Could not find TMDB ID`);
    }
  }
}

// Run the script based on command line argument
if (import.meta.main) {
  const args = Deno.args;
  const type = args[0]?.toLowerCase();

  switch (type) {
    case "movies":
      await processMovieRequests();
      break;
    case "tv":
      await processTVRequests();
      break;
    default:
      // Run both if no specific type is specified
      await processMovieRequests();
      console.log("\n"); // Add spacing between movies and TV shows
      await processTVRequests();
  }
}
