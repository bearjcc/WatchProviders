# WatchProviders
Sort OMBI requests by watch provider

## Overview
This project helps you organize and view your Ombi movie and TV show requests based on their streaming provider availability. It integrates with TMDB (The Movie Database) to fetch current streaming provider information for each request.

## Features
- Command-line interface for testing and development
- Fetches streaming provider information from TMDB
- Caches TMDB responses using Deno KV for improved performance
- Organizes Ombi requests by streaming service
- Web GUI (in development)

## Prerequisites
- Deno installed
- TMDB API key
- Ombi instance with API access

## Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Run `deno task check` to verify everything is set up correctly

## Available Commands
- `deno task fetch-ombi-movies` - Fetch current Ombi movie requests
- `deno task fetch-ombi-tv` - Fetch current Ombi TV requests
- `deno task fetch-logos` - Fetch and cache streaming service logos
- `deno task update-movie-providers` - Update streaming providers for movies
- `deno task update-tv-providers` - Update streaming providers for TV shows
- `deno task list-provider` - List media available on a specific provider
- `deno task list-all-providers` - List all available streaming providers
- `deno task list-provider-episodes` - List TV episodes available on a provider
- `deno task clear-cache` - Clear the TMDB cache
- `deno task refresh-cache` - Refresh expired TMDB cache entries
- `deno task start` - Start the development server
- `deno task check` - Run format, lint and type checks

## Caching
The project uses Deno KV to cache TMDB API responses for improved performance and reduced API calls. The cache includes:
- Movie streaming provider information
- TV show streaming provider information
- TV show search results

Cache entries expire after 7 days, after which they will be automatically refreshed on the next request. You can manually manage the cache using:
- `deno task clear-cache` to clear all cached data
- `deno task refresh-cache` to refresh expired entries

## Project Progress
- [x] Project initialization
- [x] Basic project structure
- [x] TMDB API integration
- [x] Streaming provider data fetching
- [x] Command-line interface setup
- [x] Data caching implementation
- [ ] Ombi API integration
- [ ] Database schema and setup
- [ ] Web GUI development
- [ ] Provider filtering functionality
- [ ] Request sorting and filtering
- [ ] User authentication
- [ ] Deployment documentation
- [ ] Error handling and logging
- [ ] Performance optimization

## Architecture
The project is built using:
- Deno and Fresh framework
- TMDB API for streaming provider data
- Deno KV for caching
- Ombi API for request data
- TypeScript for type safety