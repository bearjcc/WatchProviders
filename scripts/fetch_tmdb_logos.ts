import { load } from "jsr:@std/dotenv"
import { ensureDir } from "jsr:@std/fs"

// Load environment variables
const env = await load({ envPath: ".env.local" });
const API_KEY = env["TMDB_API_KEY"];
if (!API_KEY) {
  console.error("API key is missing. Ensure TMDB_API_KEY is set in .env.local.");
}

// TMDB API details
const BASE_URL = "https://api.themoviedb.org/3/watch/providers/movie";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const OUTPUT_DIR = `${Deno.cwd()}/static/images/streaming_logos`;

// Ensure output directory exists
await ensureDir(OUTPUT_DIR);

// Fetch the list of watch providers
const params = new URLSearchParams({
  api_key: API_KEY,
  watch_region: "US",
  language: "en-US",
});
const response = await fetch(`${BASE_URL}?${params}`);

if (response.ok) {
  const data = await response.json();
  if (data.results && Array.isArray(data.results)) {
    for (const provider of data.results) {
      const providerName = provider.provider_name;
      const logoPath = provider.logo_path;
      if (logoPath) {
        // Download and save the image
        const imageUrl = `${IMAGE_BASE_URL}${logoPath}`;
        try {
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const filePath = `${OUTPUT_DIR}/${providerName}.png`;
            await Deno.writeFile(filePath, new Uint8Array(imageBuffer));
            console.log(`Downloaded: ${providerName}`);
          } else {
            console.error(`Failed to download image for: ${providerName}`);
          }
        } catch (error) {
          console.error(`Error downloading image for: ${providerName} - ${error.message}`);
        }
      }
    }
  } else {
    console.error("No results found in the API response.");
  }
} else {
  console.error(`Error fetching data: ${response.status} - ${await response.text()}`);
}
