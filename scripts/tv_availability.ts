import { TVRequest, SeasonRequest, Episode } from "../types/Request.d.ts";

interface TVAvailabilityInfo {
  title: string;
  isFullyUnavailable: boolean;
  unavailableSeasons: {
    seasonNumber: number;
    isFullyUnavailable: boolean;
    unavailableEpisodes: number[];
  }[];
}

export function getTVShowAvailability(tvRequest: TVRequest): TVAvailabilityInfo {
  const result: TVAvailabilityInfo = {
    title: tvRequest.title || "Unknown Title",
    isFullyUnavailable: true,
    unavailableSeasons: [],
  };

  // If there are no child requests or the request is not available at all
  if (!tvRequest.childRequests || tvRequest.childRequests.length === 0) {
    return result;
  }

  // We'll use the first child request as it contains the season information
  const childRequest = tvRequest.childRequests[0];
  
  // If any season is available, the show is not fully unavailable
  result.isFullyUnavailable = !childRequest.seasonRequests.some(season => 
    season.seasonAvailable || season.episodes.some(ep => ep.available)
  );

  // If the show is fully unavailable, we can return early
  if (result.isFullyUnavailable) {
    return result;
  }

  // Process each season
  for (const season of childRequest.seasonRequests) {
    const unavailableEpisodes = season.episodes
      .filter(ep => !ep.available)
      .map(ep => ep.episodeNumber);

    // If there are any unavailable episodes in this season
    if (unavailableEpisodes.length > 0) {
      result.unavailableSeasons.push({
        seasonNumber: season.seasonNumber,
        isFullyUnavailable: unavailableEpisodes.length === season.episodes.length,
        unavailableEpisodes: unavailableEpisodes,
      });
    }
  }

  return result;
}

export function formatTVAvailability(availabilityInfo: TVAvailabilityInfo): string[] {
  const output: string[] = [availabilityInfo.title];

  if (availabilityInfo.isFullyUnavailable) {
    output.push("ALL");
    return output;
  }

  for (const season of availabilityInfo.unavailableSeasons) {
    if (season.isFullyUnavailable) {
      output.push(`S${season.seasonNumber}: ALL`);
    } else {
      output.push(`S${season.seasonNumber}: Episodes: ${season.unavailableEpisodes.join(", ")}`);
    }
  }

  return output;
}

// Example usage in a main function
if (import.meta.main) {
  // Mock data for testing
  const mockTVRequest: TVRequest = {
    id: 1,
    tvDbId: 123,
    externalProviderId: 456,
    qualityOverride: 0,
    rootFolder: 0,
    languageProfile: 0,
    totalSeasons: 13,
    childRequests: [{
      id: 2,
      parentRequestId: 1,
      parentRequest: "1",
      issueId: 0,
      seriesType: 0,
      subscribed: false,
      showSubscribe: false,
      releaseYear: "2020-01-01T00:00:00.000",
      issues: [],
      seasonRequests: [
        {
          seasonNumber: 12,
          overview: "Season 12",
          episodes: [
            {
              id: 3,
              episodeNumber: 3,
              available: false,
              approved: false,
              requested: true,
              seasonId: 1,
              season: "12",
              requestedDate: "2024-01-01T00:00:00.000",
              airDate: "2020-01-01T00:00:00.000",
              airDateDisplay: "Jan 1, 2020",
              requestStatus: "Pending",
              url: "",
              requestType: 0,
              source: 0,
              canApprove: true
            },
            {
              id: 4,
              episodeNumber: 9,
              available: false,
              approved: false,
              requested: true,
              seasonId: 1,
              season: "12",
              requestedDate: "2024-01-01T00:00:00.000",
              airDate: "2020-01-02T00:00:00.000",
              airDateDisplay: "Jan 2, 2020",
              requestStatus: "Pending",
              url: "",
              requestType: 0,
              source: 0,
              canApprove: true
            }
          ],
          childRequestId: 2,
          childRequest: "2",
          seasonAvailable: false,
          id: 1
        },
        {
          seasonNumber: 13,
          overview: "Season 13",
          episodes: [
            {
              id: 5,
              episodeNumber: 1,
              available: false,
              approved: false,
              requested: true,
              seasonId: 2,
              season: "13",
              requestedDate: "2024-01-01T00:00:00.000",
              airDate: "2020-02-01T00:00:00.000",
              airDateDisplay: "Feb 1, 2020",
              requestStatus: "Pending",
              url: "",
              requestType: 0,
              source: 0,
              canApprove: true
            }
          ],
          childRequestId: 2,
          childRequest: "2",
          seasonAvailable: false,
          id: 2
        }
      ],
      requestStatus: "Pending",
      requestedUserPlayedProgress: 0,
      approved: false,
      available: false,
      requestedDate: "2024-01-01T00:00:00.000",
      requestType: 0,
      source: 0,
      canApprove: true
    }],
    background: "",
    title: "Bones",
    approved: false,
    available: false,
    requestedDate: "2024-01-01T00:00:00.000",
    requestType: 0,
    source: 0,
    canApprove: true
  };

  const availability = getTVShowAvailability(mockTVRequest);
  const formatted = formatTVAvailability(availability);
  formatted.forEach(line => console.log(line));
} 