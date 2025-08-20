import { NextApiRequest, NextApiResponse } from 'next';
import { getCache, setCache } from '@/utils/cache/redisClient';

// Interface for the next handler function
type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>;

interface CacheOptions {
  // TTL in seconds
  ttl?: number;
  // Optional predicate to determine if response should be cached
  shouldCache?: (req: NextApiRequest) => boolean;
  // Optional key generator to create custom cache keys
  cacheKeyGenerator?: (req: NextApiRequest) => string;
}

/**
 * Creates a middleware that caches API responses
 * @param options Cache configuration options
 * @returns Middleware function
 */
export function withCache(options: CacheOptions = {}) {
  const {
    ttl = 300, // Default to 5 minutes
    shouldCache = (req) => req.method === 'GET',
    cacheKeyGenerator = (req) => {
      // Default key generation strategy: method + url + sorted query params
      const url = req.url || '';
      const query = req.query || {};
      const queryString = Object.keys(query)
        .sort()
        .map((key) => `${key}=${query[key]}`)
        .join('&');
      
      return `cache:${req.method}:${url}${queryString ? `?${queryString}` : ''}`;
    },
  } = options;

  // Return the middleware function
  return (handler: NextApiHandler) => async (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    // Skip caching for non-cacheable requests
    if (!shouldCache(req)) {
      return handler(req, res);
    }

    const cacheKey = cacheKeyGenerator(req);
    
    try {
      // Try to get response from cache
      const cachedResponse = await getCache(cacheKey);
      
      if (cachedResponse) {
        // If found in cache, parse and return
        const data = JSON.parse(cachedResponse);
        return res.status(200).json(data);
      }
      
      // If not in cache, create a custom response object to capture the output
      const originalJson = res.json;
      res.json = function(body) {
        // Restore original json method
        res.json = originalJson;
        
        // Cache the response if status is successful
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Don't await this to avoid blocking the response
          setCache(cacheKey, JSON.stringify(body), ttl).catch(err => {
            console.error('Failed to cache response:', err);
          });
        }
        
        // Call the original method
        return originalJson.call(this, body);
      };
      
      // Call the handler with the modified response
      return handler(req, res);
    } catch (error) {
      console.error('Cache middleware error:', error);
      // If there's an error with the cache, still try to handle the request
      return handler(req, res);
    }
  };
}

/**
 * Utility to create a custom cache key based on specific request properties
 * @param props Array of request properties to include in the cache key
 * @returns A function that generates a cache key
 */
export function createCacheKey(props: string[]) {
  return (req: NextApiRequest): string => {
    const parts = [`cache:${req.method}:${req.url}`];
    
    for (const prop of props) {
      if (prop === 'body' && req.body) {
        parts.push(JSON.stringify(req.body));
      } else if (prop === 'query' && req.query) {
        parts.push(JSON.stringify(req.query));
      } else if (prop === 'headers' && req.headers) {
        // Only include specific headers that could affect the response
        const relevantHeaders = {
          'accept-language': req.headers['accept-language'],
          'user-agent': req.headers['user-agent'],
        };
        parts.push(JSON.stringify(relevantHeaders));
      }
    }
    
    return parts.join(':');
  };
} 