import { tmdbCache } from "../utils/tmdb_cache.ts";

async function main() {
  const args = Deno.args;
  
  if (args.includes("--clear")) {
    await tmdbCache.clearCache();
  } else if (args.includes("--refresh")) {
    await tmdbCache.refreshCache();
  } else {
    console.log("Please specify either --clear to clear the cache or --refresh to refresh expired entries");
  }
}

if (import.meta.main) {
  await main();
} 