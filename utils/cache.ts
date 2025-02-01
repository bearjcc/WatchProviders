export interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

export class APICache {
  private kv: Deno.Kv;
  private defaultDuration: number;

  constructor(defaultDurationHours = 24) {
    this.defaultDuration = defaultDurationHours * 60 * 60 * 1000;
  }

  async init() {
    this.kv = await Deno.openKv();
  }

  async get<T>(key: Deno.KvKey, maxAge?: number): Promise<T | null> {
    const result = await this.kv.get(key);
    if (!result.value) return null;

    const entry = result.value as CacheEntry<T>;
    const age = Date.now() - entry.timestamp;
    
    if (age > (maxAge ?? this.defaultDuration)) {
      return null;
    }

    return entry.data;
  }

  async set<T>(key: Deno.KvKey, data: T): Promise<void> {
    await this.kv.set(key, {
      timestamp: Date.now(),
      data: data,
    });
  }
} 