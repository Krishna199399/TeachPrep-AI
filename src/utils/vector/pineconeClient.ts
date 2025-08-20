// Mock Pinecone client implementation using in-memory storage
// This is a temporary solution while Pinecone integration is pending

// Types to match Pinecone interface
interface PineconeVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

interface PineconeIndex {
  name: string;
  dimension: number;
  metric: 'cosine' | 'dotproduct' | 'euclidean';
}

interface QueryResponse {
  matches: Array<{
    id: string;
    score: number;
    metadata?: Record<string, any>;
  }>;
}

// In-memory storage
const inMemoryIndexes: Record<string, {
  config: PineconeIndex;
  vectors: PineconeVector[];
}> = {};

// Mock Pinecone client class
class MockPinecone {
  private apiKey: string;
  private environment: string;

  constructor(config: { apiKey: string; environment: string }) {
    this.apiKey = config.apiKey;
    this.environment = config.environment;
    console.log('Initialized mock Pinecone client');
  }

  async listIndexes(): Promise<PineconeIndex[]> {
    return Object.values(inMemoryIndexes).map(idx => idx.config);
  }

  async createIndex(params: {
    name: string;
    dimension: number;
    metric: 'cosine' | 'dotproduct' | 'euclidean';
  }): Promise<void> {
    inMemoryIndexes[params.name] = {
      config: params,
      vectors: []
    };
    console.log(`Created mock index: ${params.name}`);
  }

  async deleteIndex(indexName: string): Promise<void> {
    if (inMemoryIndexes[indexName]) {
      delete inMemoryIndexes[indexName];
      console.log(`Deleted mock index: ${indexName}`);
    }
  }

  index(indexName: string) {
    if (!inMemoryIndexes[indexName]) {
      console.warn(`Index ${indexName} does not exist. Creating it with default parameters.`);
      inMemoryIndexes[indexName] = {
        config: {
          name: indexName,
          dimension: 1536, // Default OpenAI embedding dimension
          metric: 'cosine'
        },
        vectors: []
      };
    }

    return {
      upsert: async (vectors: PineconeVector[]) => {
        for (const vector of vectors) {
          // Replace existing vector or add new one
          const existingIdx = inMemoryIndexes[indexName].vectors.findIndex(v => v.id === vector.id);
          if (existingIdx >= 0) {
            inMemoryIndexes[indexName].vectors[existingIdx] = vector;
          } else {
            inMemoryIndexes[indexName].vectors.push(vector);
          }
        }
        console.log(`Upserted ${vectors.length} vectors to mock index: ${indexName}`);
        return { upsertedCount: vectors.length };
      },

      query: async (params: {
        vector: number[];
        topK: number;
        includeMetadata?: boolean;
        filter?: Record<string, any>;
      }): Promise<QueryResponse> => {
        let vectors = [...inMemoryIndexes[indexName].vectors];
        
        // Apply filter if provided
        if (params.filter) {
          vectors = vectors.filter(vector => {
            if (!vector.metadata) return false;
            
            for (const [key, value] of Object.entries(params.filter as Record<string, any>)) {
              // Simple exact match filter
              if (vector.metadata[key] !== value) {
                return false;
              }
            }
            return true;
          });
        }
        
        // Calculate cosine similarity
        for (const vector of vectors) {
          const dotProduct = vector.values.reduce((sum, val, i) => sum + val * params.vector[i], 0);
          const mag1 = Math.sqrt(vector.values.reduce((sum, val) => sum + val * val, 0));
          const mag2 = Math.sqrt(params.vector.reduce((sum, val) => sum + val * val, 0));
          const score = dotProduct / (mag1 * mag2);
          (vector as any).score = score;
        }
        
        // Sort by score and return top K
        vectors.sort((a, b) => (b as any).score - (a as any).score);
        const topKVectors = vectors.slice(0, params.topK);
        
        return {
          matches: topKVectors.map(v => ({
            id: v.id,
            score: (v as any).score,
            metadata: params.includeMetadata ? v.metadata : undefined
          }))
        };
      },

      deleteMany: async (ids: string[]) => {
        const initialCount = inMemoryIndexes[indexName].vectors.length;
        inMemoryIndexes[indexName].vectors = inMemoryIndexes[indexName].vectors.filter(
          v => !ids.includes(v.id)
        );
        const deletedCount = initialCount - inMemoryIndexes[indexName].vectors.length;
        console.log(`Deleted ${deletedCount} vectors from mock index: ${indexName}`);
        return { deletedCount };
      }
    };
  }
}

// Export as Pinecone for drop-in replacement
export const Pinecone = MockPinecone;

// Global client instance
let pineconeClient: MockPinecone | null = null;

/**
 * Initialize and return a Pinecone client
 * @returns Initialized Pinecone client
 */
export async function getPineconeClient(): Promise<MockPinecone> {
  if (pineconeClient) {
    return pineconeClient;
  }

  // Get API key and environment from env variables or use defaults for mock
  const apiKey = process.env.PINECONE_API_KEY || 'mock-api-key';
  const environment = process.env.PINECONE_ENVIRONMENT || 'mock-env';

  // Initialize Pinecone client
  pineconeClient = new MockPinecone({
    apiKey,
    environment,
  });

  return pineconeClient;
}

/**
 * Get a Pinecone index
 * @param indexName Name of the index to retrieve
 * @returns Pinecone index
 */
export async function getPineconeIndex(indexName: string) {
  const client = await getPineconeClient();
  return client.index(indexName);
}

/**
 * List all Pinecone indexes
 * @returns Array of index names
 */
export async function listPineconeIndexes(): Promise<string[]> {
  const client = await getPineconeClient();
  const indexes = await client.listIndexes();
  return indexes.map(index => index.name);
}

/**
 * Create a new Pinecone index if it doesn't exist
 * @param indexName Name of the index to create
 * @param dimension Dimension of vectors to store
 * @returns The created or existing index
 */
export async function createPineconeIndexIfNotExists(
  indexName: string, 
  dimension: number = 1536, // Default dimension for OpenAI embeddings
  metric: 'cosine' | 'dotproduct' | 'euclidean' = 'cosine'
) {
  const client = await getPineconeClient();
  
  // Check if index already exists
  const existingIndexes = await listPineconeIndexes();
  
  if (!existingIndexes.includes(indexName)) {
    console.log(`Creating new mock Pinecone index: ${indexName}`);
    
    // Create the index
    await client.createIndex({
      name: indexName,
      dimension,
      metric,
    });
  }
  
  return client.index(indexName);
}

/**
 * Upsert vectors to Pinecone index
 * @param indexName Name of the index
 * @param vectors Array of vector objects to upsert
 * @returns Result of upsert operation
 */
export async function upsertVectors(
  indexName: string,
  vectors: {
    id: string;
    values: number[];
    metadata?: Record<string, any>;
  }[]
) {
  const index = await getPineconeIndex(indexName);
  return await index.upsert(vectors);
}

/**
 * Query vectors in Pinecone index
 * @param indexName Name of the index
 * @param queryVector Vector to query against
 * @param topK Number of results to return
 * @param filter Optional metadata filter
 * @returns Query results
 */
export async function queryVectors(
  indexName: string,
  queryVector: number[],
  topK: number = 5,
  filter?: Record<string, any>,
  includeMetadata: boolean = true
) {
  const index = await getPineconeIndex(indexName);
  
  return await index.query({
    vector: queryVector,
    topK,
    includeMetadata,
    filter
  });
}

/**
 * Delete vectors from Pinecone index
 * @param indexName Name of the index
 * @param ids Array of vector IDs to delete
 * @returns Result of delete operation
 */
export async function deleteVectors(indexName: string, ids: string[]) {
  const index = await getPineconeIndex(indexName);
  return await index.deleteMany(ids);
}

/**
 * Delete a Pinecone index
 * @param indexName Name of the index to delete
 * @returns True if successful
 */
export async function deletePineconeIndex(indexName: string): Promise<boolean> {
  try {
    const client = await getPineconeClient();
    await client.deleteIndex(indexName);
    return true;
  } catch (error) {
    console.error(`Error deleting mock Pinecone index ${indexName}:`, error);
    return false;
  }
} 