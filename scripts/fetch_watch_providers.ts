import { config } from "dotenv";
import { join } from "$std/path/mod.ts";

// Load environment variables
const env = config({
  path: join(Deno.cwd(), ".env"),
});

interface ApiWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

interface WatchProvider {
  id: number;
  name: string;
  logoPath: string;
  priority: number;
  aliases: string[];
}

interface WatchProvidersResponse {
  results: ApiWatchProvider[];
}

async function fetchWatchProviders(): Promise<WatchProvidersResponse> {
  const apiUrl = `${env["OMBI_BASE_URL"]}/api/v1/TheMovieDb/WatchProviders/movie`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch watch providers: ${response.statusText}`);
  }
  return response.json();
}

async function saveProvidersToFile(providers: WatchProvider[]) {
  const filePath = join(Deno.cwd(), "database", "watch_providers.json");
  await Deno.writeTextFile(filePath, JSON.stringify(providers, null, 2));
}

async function main() {
  try {
    const data = await fetchWatchProviders();
    const providers = data.results.map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoPath: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
      priority: provider.display_priority,
      aliases: [],
    }));

    await saveProvidersToFile(providers);
    console.log(`Successfully saved ${providers.length} watch providers`);
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    Deno.exit(1);
  }
}

await main();
