# WatchProviders
Sort OMBI requests by watch provider

## Overview
This project helps you organize and view your Ombi movie and TV show requests based on their streaming provider availability. It integrates with TMDB (The Movie Database) to fetch current streaming provider information for each request.

## Features
- Command-line interface for testing and development
- Fetches streaming provider information from TMDB
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
- `deno task fetch-ombi` - Fetch current Ombi requests
- `deno task fetch-logos` - Fetch and cache streaming service logos
- `deno task start` - Start the development server
- `deno task check` - Run format, lint and type checks

## Project Progress
- [x] Project initialization
- [x] Basic project structure
- [x] TMDB API integration
- [x] Streaming provider data fetching
- [x] Command-line interface setup
- [ ] Ombi API integration
- [ ] Database schema and setup
- [ ] Data caching implementation
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
- Ombi API for request data
- TypeScript for type safety