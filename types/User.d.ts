import { ISODateTimeString } from "./ISODateString.d.ts";

export interface OmbiUser {
  alias: string;
  userType: number;
  providerUserId: string;
  lastLoggedIn?: ISODateTimeString;
  language?: string;
  streamingCountry?: string;
  movieRequestLimit: number;
  episodeRequestLimit: number;
  musicRequestLimit: number;
  movieRequestLimitType: number;
  episodeRequestLimitType: number;
  musicRequestLimitType: number;
  userAccessToken: string;
  mediaServerToken: string;
  notificationUserIds?: NotificationUserId[];
  userNotificationPreferences?: UserNotificationPreference[];
  isEmbyConnect: boolean;
  userAlias?: string;
  emailLogin: boolean;
  isSystemUser: boolean;
  id: string;
  userName: string;
  normalizedUserName?: string;
  email?: string;
  normalizedEmail?: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd?: ISODateTimeString;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface NotificationUserId {
  playerId: string;
  userId: string;
  addedAt?: ISODateTimeString;
  user: string;
  id: number;
}

export interface UserNotificationPreference {
  userId: string;
  agent: number;
  enabled: boolean;
  value: string;
  id: number;
}
