import { ISODateTimeString } from "./ISODateTimeString.d.ts";
import { Issue } from "./Issue.d.ts";
import { OmbiUser } from "./User.d.ts";

export interface BaseRequest {
  id: number;
  imdbId?: string;
  title?: string;
  overview?: string;
  posterPath?: string;
  releaseDate?: ISODateTimeString;
  status?: string;
  approved: boolean;
  markedAsApproved?: ISODateTimeString;
  requestedDate: ISODateTimeString;
  available: boolean;
  markedAsAvailable?: ISODateTimeString;
  requestedUserId?: string;
  denied?: boolean;
  markedAsDenied?: ISODateTimeString;
  deniedReason?: string;
  requestType: number;
  requestedByAlias?: string;
  requestedUser?: OmbiUser;
  source: number;
  canApprove: boolean;
  streamingProviders?: string[];
}

export interface MovieRequest extends BaseRequest {
  theMovieDbId: number;
  issueId: number;
  issues?: Issue[];
  subscribed: boolean;
  showSubscribe: boolean;
  is4kRequest: boolean;
  rootPathOverride?: number;
  qualityOverride?: number;
  has4KRequest: boolean;
  approved4K: boolean;
  markedAsApproved4K?: ISODateTimeString;
  requestedDate4k?: ISODateTimeString;
  available4K: boolean;
  markedAsAvailable4K?: ISODateTimeString;
  denied4K?: boolean;
  markedAsDenied4K?: ISODateTimeString;
  deniedReason4K?: string;
  requestCombination: number;
  langCode?: string;
  watchedByRequestedUser: boolean;
  playedByUsersCount: number;
  digitalReleaseDate?: ISODateTimeString;
  background?: string;
  released: boolean;
  digitalRelease: boolean;
}

export interface TVRequest extends BaseRequest {
  tvDbId: number;
  externalProviderId: number;
  qualityOverride: number;
  rootFolder: number;
  languageProfile: number;
  totalSeasons: number;
  childRequests: ChildRequest[];
  background: string;
}


export interface ChildRequest extends BaseRequest {
  parentRequest: string;
  parentRequestId: number;
  issueId: number;
  seriesType: number;
  subscribed: boolean;
  showSubscribe: boolean;
  releaseYear: ISODateTimeString;
  issues: Issue[];
  seasonRequests: SeasonRequest[];
  requestStatus: string;
  requestedUserPlayedProgress: number;
}

export interface SeasonRequest {
  seasonNumber: number;
  overview: string;
  episodes: Episode[];
  childRequestId: number;
  childRequest: string;
  seasonAvailable: boolean;
  id: number;
}

export interface Episode extends BaseRequest {
  episodeNumber: number;
  airDate: ISODateTimeString;
  url: string;
  requested: boolean;
  seasonId: number;
  season: string;
  airDateDisplay: string;
  requestStatus: string;
}
