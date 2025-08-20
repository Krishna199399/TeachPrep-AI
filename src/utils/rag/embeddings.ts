// Use direct fetch API with OpenRouter for embeddings
// This avoids the "is not a constructor" error

// OpenRouter API key and configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_EMBEDDING_MODEL = 'openai/text-embedding-ada-002';

// For local/mock operation when API is not available
const USE_MOCK_DATA = false; // Set to false to use real API

// Default model for embeddings
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-ada-002';

// Generate mock/random embeddings for testing
function generateMockEmbedding(dimension: number = 1536): number[] {
  console.log("Using mock embeddings due to API unavailability");
  const embedding = [];
  for (let i = 0; i < dimension; i++) {
    // Create values between -0.1 and 0.1 for realistic embeddings
    embedding.push((Math.random() * 0.2) - 0.1);
  }
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Generate embeddings for an array of texts
 * @param texts Array of texts to generate embeddings for
 * @param model OpenAI embedding model name
 * @returns Array of embedding vectors
 */
export async function getEmbeddings(
  texts: string[],
  model: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[][]> {
  try {
    if (USE_MOCK_DATA) {
      return texts.map(() => generateMockEmbedding());
    }
    
    console.log('Calling OpenRouter embeddings API via proxy...');
    
    // Use our proxy endpoint instead of calling OpenRouter directly
    const response = await fetch('/api/proxy/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: 'embeddings',
        body: {
          model: OPENROUTER_EMBEDDING_MODEL,
          input: texts
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${errorText}`);
      
      // If API fails, fallback to mock data
      console.warn('Falling back to mock embeddings due to API error');
      return texts.map(() => generateMockEmbedding());
    }
    
    const data = await response.json();
    console.log('OpenRouter embeddings received successfully');
    return data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Fall back to mock data on error
    console.warn('Falling back to mock embeddings due to error');
    return texts.map(() => generateMockEmbedding());
  }
}

/**
 * Generate embedding for a single text
 * @param text Text to generate embedding for
 * @param model OpenAI embedding model name
 * @returns Embedding vector
 */
export async function getEmbedding(
  text: string,
  model: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[]> {
  const embeddings = await getEmbeddings([text], model);
  return embeddings[0];
}

/**
 * Calculate cosine similarity between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Cosine similarity (between -1 and 1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must be of the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Calculate the token count for a text (rough estimate)
 * @param text Input text
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // A very rough approximation: 1 token ~= 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token limit
 * @param text Input text
 * @param maxTokens Maximum tokens to allow
 * @returns Truncated text
 */
export function truncateToTokenLimit(text: string, maxTokens: number = 8000): string {
  const estimatedTokens = estimateTokenCount(text);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  // Truncate the text to approximate the token limit
  const ratio = maxTokens / estimatedTokens;
  const truncatedLength = Math.floor(text.length * ratio);
  
  // Try to truncate at a sentence or paragraph boundary if possible
  const truncatedText = text.substring(0, truncatedLength);
  
  // Find the last complete sentence
  const lastPeriod = truncatedText.lastIndexOf('.');
  const lastQuestion = truncatedText.lastIndexOf('?');
  const lastExclamation = truncatedText.lastIndexOf('!');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastSentenceEnd > truncatedLength * 0.8) {
    return truncatedText.substring(0, lastSentenceEnd + 1);
  }
  
  return truncatedText;
} 