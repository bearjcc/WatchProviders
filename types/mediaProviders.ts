export enum BusinessModel {
  Subscription = "subscription",   // Requires paid subscription (Netflix, Disney+)
  FreeWithAds = "free-with-ads",  // Free content with advertisements (Pluto, Tubi)
  VOD = "vod",                    // Pay per view/rental (Microsoft Store)
  Hybrid = "hybrid"               // Mix of free and premium content (YouTube, Peacock)
}

export class MediaProvider {
  readonly streamFabModule: string;
  readonly logo: string;
  readonly aliases: string[];
  readonly businessModel: BusinessModel;
  readonly streamFabModulePurchased: boolean;

  constructor(
    streamFabModule: string,
    logo?: string,
    aliases?: string[],
    businessModel?: BusinessModel,
    streamFabModulePurchased?: boolean
  ) {
    this.streamFabModule = streamFabModule;
    this.logo = logo ?? "/static/images/streaming_logos/Unavailable.svg";
    this.aliases = aliases ?? [];
    this.businessModel = businessModel ?? BusinessModel.Subscription;
    this.streamFabModulePurchased = streamFabModulePurchased ?? true;
  }

  static create(params: {
    streamFabModule: string;
    logo?: string;
    aliases?: string[];
    businessModel?: BusinessModel;
    streamFabModulePurchased?: boolean;
  }): MediaProvider {
    return new MediaProvider(
      params.streamFabModule,
      params.logo,
      params.aliases,
      params.businessModel,
      params.streamFabModulePurchased
    );
  }

  // Initialize provider name to MediaProvider mapping
  private static providerMap: Map<string, MediaProvider> | null = null;

  private static initializeProviderMap(): void {
    if (this.providerMap !== null) return;
    
    this.providerMap = new Map();
    for (const provider of providers) {
      // Map the streamFabModule name
      this.providerMap.set(provider.streamFabModule.toLowerCase(), provider);
      
      // Map all aliases
      for (const alias of provider.aliases) {
        this.providerMap.set(alias.toLowerCase(), provider);
      }
    }
  }

  static fromTMDBProviders(tmdbProviders: { provider_name: string; logo_path: string }[]): MediaProvider[] {
    this.initializeProviderMap();
    const uniqueProviders = new Set<MediaProvider>();
    
    for (const tmdbProvider of tmdbProviders) {
      const provider = this.providerMap?.get(tmdbProvider.provider_name.toLowerCase());
      if (provider) {
        uniqueProviders.add(provider);
      } else {
        // If no matching provider found, create a new one with Unavailable module
        uniqueProviders.add(
          new MediaProvider(
            "Unavailable",
            `https://image.tmdb.org/t/p/original${tmdbProvider.logo_path}`,
            [tmdbProvider.provider_name]
          )
        );
      }
    }
    
    return Array.from(uniqueProviders);
  }
}

export const providers: MediaProvider[] = [
  MediaProvider.create({
    streamFabModule: "NETFLIX",
    aliases: ["Netflix", "Netflix basic with Ads", "Netflix Kids"]
  }),
  MediaProvider.create({
    streamFabModule: "YouTube MOVIES",
    aliases: [
      "YouTube",
      "YouTube Premium",
      "YouTube Free",
      "YouTube Movies",
      "Facebook",
      "Vimeo",
      "Instagram",
      "Twitter",
      "TikTok",
      "Dailymotion",
      "NBC",
      "ABC",
      "PBS"
    ],
    businessModel: BusinessModel.Hybrid,
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "amazon",
    logo: "/static/images/streaming_logos/Amazon Prime Video with Ads.png",
    aliases: ["Amazon Prime Video", "Amazon Prime Video with Ads", "Amazon Video", "Amazon Prime"],
    businessModel: BusinessModel.Hybrid
  }),
  MediaProvider.create({
    streamFabModule: "HBO MAX",
    aliases: ["HBO Max", "Max", "Max Amazon Channel"]
  }),
  MediaProvider.create({
    streamFabModule: "max",
    aliases: ["Max", "Max Amazon Channel", "HBO Max"]
  }),
  MediaProvider.create({
    streamFabModule: "HBO NOW",
    aliases: ["HBO Now"]
  }),
  MediaProvider.create({
    streamFabModule: "HBO EUROPE",
    aliases: ["HBO Europe"]
  }),
  MediaProvider.create({
    streamFabModule: "hulu",
    aliases: ["Hulu", "FXNow"]
  }),
  MediaProvider.create({
    streamFabModule: "DISNEY+",
    aliases: ["Disney Plus", "Disney+", "DisneyNOW"]
  }),
  MediaProvider.create({
    streamFabModule: "Paramount+",
    aliases: [
      "Paramount Plus",
      "Paramount+",
      "Paramount Plus Apple TV Channel",
      "Paramount+ Amazon Channel",
      "Paramount+ Roku Premium Channel",
      "Paramount+ with Showtime"
    ]
  }),
  MediaProvider.create({
    streamFabModule: "U-NEXT",
    aliases: ["U-NEXT"]
  }),
  MediaProvider.create({
    streamFabModule: "tv+",
    logo: "/static/images/streaming_logos/Apple TV Plus Amazon Channel.png",
    aliases: ["Apple TV Plus", "Apple TV+", "Apple TV Plus Amazon Channel", "Apple TV"],
    businessModel: BusinessModel.Hybrid
  }),
  MediaProvider.create({
    streamFabModule: "ABEMA",
    aliases: ["Abema"]
  }),
  MediaProvider.create({
    streamFabModule: "ESPN+",
    logo: "/static/images/streaming_logos/ESPN Plus.png",
    aliases: ["ESPN Plus", "ESPN+"]
  }),
  MediaProvider.create({
    streamFabModule: "Rakuten TV",
    aliases: ["Rakuten TV"],
    businessModel: BusinessModel.VOD
  }),
  MediaProvider.create({
    streamFabModule: "discovery+",
    aliases: ["Discovery+", "Discovery+ Amazon Channel", "Discovery", "Discovery +"]
  }),
  MediaProvider.create({
    streamFabModule: "FOD",
    aliases: ["FOD"]
  }),
  MediaProvider.create({
    streamFabModule: "joyn",
    aliases: ["Joyn"],
    businessModel: BusinessModel.FreeWithAds
  }),
  MediaProvider.create({
    streamFabModule: "RTL+",
    aliases: ["RTL+"]
  }),
  MediaProvider.create({
    streamFabModule: "vip",
    aliases: ["VIP"]
  }),
  MediaProvider.create({
    streamFabModule: "crunchyroll",
    aliases: ["Crunchyroll", "Crunchyroll Amazon Channel"],
    businessModel: BusinessModel.Hybrid
  }),
  MediaProvider.create({
    streamFabModule: "DMM.com",
    aliases: ["DMM.com"]
  }),
  MediaProvider.create({
    streamFabModule: "peacock!",
    logo: "/static/images/streaming_logos/Peacock Premium Plus.png",
    aliases: ["Peacock", "Peacock Premium", "Peacock Premium Plus"],
    businessModel: BusinessModel.Hybrid
  }),
  MediaProvider.create({
    streamFabModule: "tubi",
    aliases: ["Tubi", "Tubi TV"],
    businessModel: BusinessModel.FreeWithAds
  }),
  MediaProvider.create({
    streamFabModule: "Lemino",
    aliases: ["Lemino"]
  }),
  MediaProvider.create({
    streamFabModule: "pluto tv",
    aliases: ["Pluto TV"],
    businessModel: BusinessModel.FreeWithAds
  }),
  MediaProvider.create({
    streamFabModule: "Roku Channel",
    aliases: ["Roku Channel", "The Roku Channel"],
    businessModel: BusinessModel.FreeWithAds
  }),
  MediaProvider.create({
    streamFabModule: "THE CW",
    aliases: ["The CW"],
    businessModel: BusinessModel.FreeWithAds
  }),
  MediaProvider.create({
    streamFabModule: "Stan.",
    aliases: ["Stan"]
  }),
  MediaProvider.create({
    streamFabModule: "CANAL+",
    aliases: ["Canal+"]
  }),
  MediaProvider.create({
    streamFabModule: "4",
    aliases: ["Channel 4", "Channel 4 Plus"],
    businessModel: BusinessModel.FreeWithAds
  }),
  MediaProvider.create({
    streamFabModule: "CRACKLE",
    aliases: ["Crackle"],
    businessModel: BusinessModel.FreeWithAds
  }),
  MediaProvider.create({
    streamFabModule: "STAR+",
    aliases: ["Star+"]
  }),
  MediaProvider.create({
    streamFabModule: "TELASA",
    aliases: ["Telasa"]
  }),
  MediaProvider.create({
    streamFabModule: "SkyShowtime",
    aliases: ["Sky Showtime"]
  }),
  // Free to try modules
  MediaProvider.create({
    streamFabModule: "NHK+",
    aliases: ["NHK+"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "itvX",
    aliases: ["itvX"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "WOWOW",
    aliases: ["WOWOW"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "TVer",
    aliases: ["TVer"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "WOW",
    aliases: ["WOW"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "NOW",
    aliases: ["NOW"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "dアニメストア",
    aliases: ["dアニメストア"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "ViX",
    aliases: ["ViX"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "FANDANGO AT HOME",
    aliases: ["Fandango At Home"],
    streamFabModulePurchased: false
  }),
  MediaProvider.create({
    streamFabModule: "Unavailable",
    aliases: [
      // Streaming Services
      "AMC Plus Apple TV Channel",
      "AMC+ Amazon Channel",
      "AMC+ Roku Premium Channel",
      "AMC",
      "Shudder",
      "Sundance Now",
      "MGM+ Amazon Channel",
      "MGM Plus",
      "MGM Plus Roku Premium Channel",
      "Starz Apple TV Channel",
      "Starz Amazon Channel",
      "Starz Roku Premium Channel",
      "Starz",
      "Britbox Apple TV Channel",
      "BritBox Amazon Channel",
      "BritBox",
      "Criterion Channel",
      // Network TV
      "NBC",
      "ABC",
      "CBS",
      "PBS",
      "PBS Kids Amazon Channel",
      "PBS Masterpiece Amazon Channel",
      "BBC America",
      "USA Network",
      "TNT",
      "TBS",
      "TCM",
      "Bravo TV",
      "tru TV",
      "Freeform",
      "History",
      "Lifetime",
      // Sports
      "ESPN",
      "fuboTV",
      // Rental/Purchase Services
      "Microsoft Store",
      "Vudu",
      "VUDU Free",
      // Niche Streaming
      "MUBI",
      "MUBI Amazon Channel",
      "Acorn TV",
      "AcornTV Amazon Channel",
      "Shout! Factory TV",
      "Rakuten Viki",
      "Hoopla",
      "Kanopy",
      "Plex",
      "Plex Channel",
      // Other
      "JustWatchTV",
      "FlixFling",
      "Spectrum On Demand"
    ]
  })
];
