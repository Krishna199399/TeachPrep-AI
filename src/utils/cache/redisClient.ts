// Mock Redis client implementation using in-memory cache
// This allows the app to run without requiring Redis
const inMemoryCache = new Map<string, { value: string; expiry: number | null }>();

/**
 * Mock Redis client implementation
 */
class MockRedisClient {
  isOpen: boolean = true;

  async connect(): Promise<void> {
    this.isOpen = true;
    console.log('Mock Redis client connected');
    return Promise.resolve();
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
    const expiry = options?.EX ? Date.now() + options.EX * 1000 : null;
    inMemoryCache.set(key, { value, expiry });
    return Promise.resolve('OK');
  }

  async get(key: string): Promise<string | null> {
    const entry = inMemoryCache.get(key);
    if (!entry) return null;
    
    // Check if the entry is expired
    if (entry.expiry && entry.expiry < Date.now()) {
      inMemoryCache.delete(key);
      return null;
    }
    
    return Promise.resolve(entry.value);
  }

  async del(key: string): Promise<number> {
    const deleted = inMemoryCache.delete(key);
    return Promise.resolve(deleted ? 1 : 0);
  }

  async exists(key: string): Promise<number> {
    const exists = inMemoryCache.has(key);
    return Promise.resolve(exists ? 1 : 0);
  }

  async quit(): Promise<string> {
    this.isOpen = false;
    return Promise.resolve('OK');
  }

  on(event: string, callback: (err: Error) => void): void {
    // Event handling is not implemented in the mock
  }
}

// Type for Redis client
interface RedisClientType {
  isOpen: boolean;
  connect(): Promise<void>;
  set(key: string, value: string, options?: { EX?: number }): Promise<string>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  quit(): Promise<string>;
  on(event: string, callback: (err: Error) => void): void;
}

let redisClient: RedisClientType | null = null;

/**
 * Initializes and returns a Redis client (mock implementation)
 * @returns {Promise<RedisClientType>} Connected Redis client
 */
export async function getRedisClient(): Promise<RedisClientType> {
  // If client exists and is connected, return it
  if (redisClient?.isOpen) {
    return redisClient;
  }

  try {
    // Create a new mock Redis client
    redisClient = new MockRedisClient();
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to create mock Redis client:', error);
    throw new Error('Failed to create mock Redis client');
  }
}

/**
 * Sets a value in cache with optional expiration
 * @param {string} key - Cache key
 * @param {string} value - Value to cache
 * @param {number} expireSeconds - Time to live in seconds (optional)
 * @returns {Promise<void>}
 */
export async function setCache(key: string, value: string, expireSeconds?: number): Promise<void> {
  try {
    const client = await getRedisClient();
    
    if (expireSeconds) {
      await client.set(key, value, { EX: expireSeconds });
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    console.error(`Failed to set cache for key ${key}:`, error);
  }
}

/**
 * Gets a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<string|null>} Cached value or null if not found
 */
export async function getCache(key: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    return await client.get(key);
  } catch (error) {
    console.error(`Failed to get cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Deletes a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.del(key);
    return result > 0;
  } catch (error) {
    console.error(`Failed to delete cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Checks if a key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`Failed to check existence for key ${key}:`, error);
    return false;
  }
}

/**
 * Closes the client connection
 * @returns {Promise<void>}
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
} 