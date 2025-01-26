import { load } from "jsr:@std/dotenv";
import { MovieRequest, TVRequest } from "../types/Request.d.ts";

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
  } catch (error) {
    console.error(`Error fetching ${type} requests: ${error.message}`);
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

// Run the script if called directly
if (import.meta.main) {
  console.log("Fetching movie requests...");
  const movieRequests = await fetchMovieRequests();

  movieRequests.forEach((movie) => {
    console.log(`${movie.title} (${movie.releaseDate?.split("-")[0]})`);
  });

  console.log("Fetching TV requests...");
  const tvRequests = await fetchTVRequests();

  tvRequests.forEach((tv) => {
    console.log(`${tv.title} (${tv.releaseDate?.split("-")[0]})`);
  });
}
