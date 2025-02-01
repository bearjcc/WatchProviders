import { load } from "jsr:@std/dotenv";
import { MovieRequest, TVRequest } from "../types/Request.d.ts";
import { getTVShowAvailability, formatTVAvailability } from "./tv_availability.ts";

// Load environment variables
const env = await load({ envPath: ".env" });
const OMBI_API_KEY = env.OMBI_API_KEY;
const OMBI_BASE_URL = env.OMBI_BASE_URL || "http://localhost:5000";

if (!OMBI_API_KEY) {
  console.error("Missing OMBI_API_KEY in .env");
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
  } catch (error: unknown) {
    console.error(`Error fetching ${type} requests: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

export async function fetchMovieRequests(): Promise<MovieRequest[]> {
  return await fetchRequests<MovieRequest>(
    "movie",
    (req) =>
      req.available === false && req.releaseDate != null &&
      new Date(req.releaseDate) <= new Date(),
  );
}

export async function fetchTVRequests(): Promise<TVRequest[]> {
  return await fetchRequests<TVRequest>("tv", (req) =>
    req.childRequests &&
    req.childRequests.some((child) =>
      child.seasonRequests.some((season) =>
        season.episodes.some((episode) => !episode.available)
      )
    ));
}

// Main functions to run when script is called directly
async function processMovieRequests() {
  console.log("Fetching movie requests...");
  const movieRequests = await fetchMovieRequests();
  console.log(`Found ${movieRequests.length} movie requests`);
  for (const movie of movieRequests) {
    console.log(`${movie.title} (${movie.releaseDate?.split("-")[0]})`);
  }
}

async function processTVRequests() {
  console.log("Fetching TV requests...");
  const tvRequests = await fetchTVRequests();
  console.log(`Found ${tvRequests.length} TV requests`);
  for (const tv of tvRequests) {
    const availability = getTVShowAvailability(tv);
    const formatted = formatTVAvailability(availability);
    formatted.forEach(line => console.log(line));
    console.log(); // Add a blank line between shows
  }
}

// Run main if this is the main module
if (import.meta.main) {
  const args = Deno.args;
  if (args.includes("--movies")) {
    await processMovieRequests();
  } else if (args.includes("--tv")) {
    await processTVRequests();
  } else {
    console.log("Please specify --movies or --tv");
  }
}
