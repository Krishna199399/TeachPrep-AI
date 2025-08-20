import { createPineconeIndexIfNotExists, upsertVectors } from '@/utils/vector/pineconeClient';
import { getEmbeddings } from './embeddings';

// Constants for document processing
const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_CHUNK_OVERLAP = 100;
const DEFAULT_INDEX_NAME = 'teachprep-docs';

/**
 * Represents a document to be processed
 */
export interface Document {
  id: string;
  content: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    grade?: string;
    type?: string;
    tags?: string[];
    source?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  };
}

/**
 * Chunk a document into smaller pieces for better embeddings
 * @param document The document to chunk
 * @param chunkSize Maximum size of each chunk
 * @param chunkOverlap Overlap between chunks
 * @returns Array of document chunks
 */
export function chunkDocument(
  document: Document,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = DEFAULT_CHUNK_OVERLAP
): Document[] {
  const { content, ...rest } = document;
  const words = content.split(/\s+/);
  const chunks: Document[] = [];

  // For very small documents, don't chunk
  if (words.length <= chunkSize) {
    return [document];
  }

  // Create chunks with overlap
  for (let i = 0; i < words.length; i += chunkSize - chunkOverlap) {
    const chunkWords = words.slice(i, i + chunkSize);
    const chunkContent = chunkWords.join(' ');
    
    // Create a unique ID for the chunk
    const chunkId = `${document.id}-chunk-${chunks.length + 1}`;
    
    chunks.push({
      ...rest,
      id: chunkId,
      content: chunkContent,
      metadata: {
        ...document.metadata,
        parentDocumentId: document.id,
        chunkIndex: chunks.length,
      },
    });
  }

  return chunks;
}

/**
 * Process documents into embeddings and store in vector database
 * @param documents Array of documents to process
 * @param indexName Pinecone index name
 * @returns Number of chunks processed
 */
export async function processDocuments(
  documents: Document[],
  indexName: string = DEFAULT_INDEX_NAME
): Promise<number> {
  // Ensure Pinecone index exists
  await createPineconeIndexIfNotExists(indexName);
  
  let totalChunks = 0;
  
  // Process documents in batches to avoid overloading the API
  const batchSize = 10;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    // Chunk documents
    const chunks: Document[] = [];
    for (const doc of batch) {
      const docChunks = chunkDocument(doc);
      chunks.push(...docChunks);
    }
    
    totalChunks += chunks.length;
    
    // Generate embeddings for chunks in smaller batches
    const embeddingBatchSize = 5;
    for (let j = 0; j < chunks.length; j += embeddingBatchSize) {
      const embeddingBatch = chunks.slice(j, j + embeddingBatchSize);
      
      // Get content for embeddings
      const chunkTexts = embeddingBatch.map(chunk => chunk.content);
      
      // Generate embeddings
      const embeddings = await getEmbeddings(chunkTexts);
      
      // Prepare vectors for Pinecone
      const vectors = embeddingBatch.map((chunk, idx) => ({
        id: chunk.id,
        values: embeddings[idx],
        metadata: chunk.metadata,
      }));
      
      // Upsert vectors to Pinecone
      await upsertVectors(indexName, vectors);
    }
    
    console.log(`Processed batch ${i / batchSize + 1}/${Math.ceil(documents.length / batchSize)}`);
  }
  
  return totalChunks;
}

/**
 * Process a single document and store it in the vector database
 * @param document Document to process
 * @param indexName Pinecone index name
 * @returns Number of chunks processed
 */
export async function processDocument(
  document: Document,
  indexName: string = DEFAULT_INDEX_NAME
): Promise<number> {
  return processDocuments([document], indexName);
}

/**
 * Convert raw content to a document structure
 * @param content Raw text content
 * @param metadata Document metadata
 * @returns Structured document
 */
export function createDocument(
  content: string,
  metadata: Document['metadata']
): Document {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    content,
    metadata,
  };
} 