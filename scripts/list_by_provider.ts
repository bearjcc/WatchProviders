import { load } from "jsr:@std/dotenv";
import { MovieRequest, TVRequest } from "../types/Request.d.ts";
import { MediaProvider, providers } from "../types/mediaProviders.ts";
import { fetchMovieRequests, fetchTVRequests } from "./fetch_ombi_requests.ts";
import { updateMovieRequestProviders, updateTVRequestProviders } from "./update_request_providers.ts";
import { getTVShowAvailability, formatTVAvailability } from "./tv_availability.ts";

interface MediaRequestWithType {
  type: "movie" | "tv";
  title: string | undefined;
  year: string | undefined;
}

export async function getMediaByProvider(providerInput: string): Promise<MediaRequestWithType[]> {
  // Get all requests and update their providers
  const [movieRequests, tvRequests] = await Promise.all([
    fetchMovieRequests(),
    fetchTVRequests()
  ]);

  await Promise.all([
    updateMovieRequestProviders(movieRequests),
    updateTVRequestProviders(tvRequests)
  ]);

  // Find the provider - either by exact streamFabModule or by searching through providers
  let targetProvider: MediaProvider | undefined;
  if (providers.some(p => p.streamFabModule === providerInput)) {
    targetProvider = providers.find(p => p.streamFabModule === providerInput);
  } else {
    // Search through all providers to find one that matches the input as an alias
    targetProvider = providers.find(p => 
      p.aliases.some(alias => alias.toLowerCase() === providerInput.toLowerCase())
    );
  }

  if (!targetProvider) {
    console.error(`Provider "${providerInput}" not found`);
    return [];
  }

  const result: MediaRequestWithType[] = [];

  // Add movies available on this provider
  for (const movie of movieRequests) {
    if (movie.mediaProviders?.includes(targetProvider.streamFabModule)) {
      result.push({
        type: "movie",
        title: movie.title,
        year: movie.releaseDate?.split("-")[0]
      });
    }
  }

  // Add TV shows available on this provider
  for (const tv of tvRequests) {
    if (tv.mediaProviders?.includes(targetProvider.streamFabModule)) {
      result.push({
        type: "tv",
        title: tv.title,
        year: tv.releaseDate?.split("-")[0]
      });
    }
  }

  return result;
}

export async function getAllMediaByProvider(): Promise<Map<string, MediaRequestWithType[]>> {
  const result = new Map<string, MediaRequestWithType[]>();

  // Get all unique streamFabModules
  const uniqueModules = new Set(providers.map(p => p.streamFabModule));

  // Process each module
  for (const module of uniqueModules) {
    const mediaList = await getMediaByProvider(module);
    if (mediaList.length > 0) {
      result.set(module, mediaList);
    }
  }

  return result;
}

function formatMediaList(mediaList: MediaRequestWithType[]): string {
  return mediaList
    .sort((a, b) => {
      // First sort by type (movies first)
      if (a.type !== b.type) {
        return a.type === "movie" ? -1 : 1;
      }
      // Then by title
      return (a.title || "").localeCompare(b.title || "");
    })
    .map(media => `  ${media.type === "movie" ? "🎬" : "📺"} ${media.title} (${media.year || "N/A"})`)
    .join("\n");
}

// Main functions to run when script is called directly
async function processProvider(provider: string) {
  console.log(`\nFetching media available on ${provider}...`);
  const mediaList = await getMediaByProvider(provider);
  
  if (mediaList.length === 0) {
    console.log("No media found for this provider");
    return;
  }

  const movies = mediaList.filter(m => m.type === "movie").length;
  const shows = mediaList.filter(m => m.type === "tv").length;
  
  console.log(`Found ${movies} movies and ${shows} TV shows:\n`);
  console.log(formatMediaList(mediaList));
}

async function processAllProviders() {
  console.log("Fetching media for all providers...");
  const allMedia = await getAllMediaByProvider();
  
  for (const [module, mediaList] of allMedia) {
    const movies = mediaList.filter(m => m.type === "movie").length;
    const shows = mediaList.filter(m => m.type === "tv").length;
    
    console.log(`\n=== ${module} ===`);
    console.log(`${movies} movies and ${shows} TV shows:\n`);
    console.log(formatMediaList(mediaList));
    console.log("\n" + "=".repeat(40) + "\n");
  }
}

async function processProviderWithEpisodes(provider: string) {
  console.log(`\nFetching media available on ${provider}...`);
  const [movieRequests, tvRequests] = await Promise.all([
    fetchMovieRequests(),
    fetchTVRequests()
  ]);

  await Promise.all([
    updateMovieRequestProviders(movieRequests),
    updateTVRequestProviders(tvRequests)
  ]);

  // Find the provider
  let targetProvider: MediaProvider | undefined;
  if (providers.some(p => p.streamFabModule === provider)) {
    targetProvider = providers.find(p => p.streamFabModule === provider);
  } else {
    targetProvider = providers.find(p => 
      p.aliases.some(alias => alias.toLowerCase() === provider.toLowerCase())
    );
  }

  if (!targetProvider) {
    console.error(`Provider "${provider}" not found`);
    return;
  }

  // Filter TV shows for this provider
  const providerTVShows = tvRequests.filter(tv => 
    tv.mediaProviders?.includes(targetProvider!.streamFabModule)
  );

  if (providerTVShows.length === 0) {
    console.log("No TV shows found for this provider");
    return;
  }

  console.log(`Found ${providerTVShows.length} TV shows:\n`);
  
  // Process each TV show
  for (const show of providerTVShows) {
    const availability = getTVShowAvailability(show);
    const formatted = formatTVAvailability(availability);
    formatted.forEach(line => console.log(line));
    console.log(); // Add blank line between shows
  }
}

// Run main if this is the main module
if (import.meta.main) {
  const args = Deno.args;
  if (args.includes("--all")) {
    await processAllProviders();
  } else if (args.includes("--episodes")) {
    const provider = args[args.indexOf("--episodes") + 1] || "NETFLIX"; // Default to Netflix if no provider specified
    await processProviderWithEpisodes(provider);
  } else {
    const provider = args[0];
    if (!provider) {
      console.log("Please specify a provider name or use --all to list all providers");
      Deno.exit(1);
    }
    await processProvider(provider);
  }
} 