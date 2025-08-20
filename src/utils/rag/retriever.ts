import { getEmbedding, truncateToTokenLimit } from './embeddings';
import { queryVectors } from '../vector/pineconeClient';
import { Document } from './documentProcessor';

// Constants for the retriever
const DEFAULT_INDEX_NAME = 'teachprep-docs';
const DEFAULT_TOP_K = 5;

/**
 * Result of a RAG query
 */
export interface RAGResult {
  query: string;
  documents: Document[];
  context: string;
}

/**
 * Filter for RAG queries
 */
export interface RAGFilter {
  subject?: string;
  grade?: string;
  type?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * Options for RAG retrieval
 */
export interface RAGOptions {
  indexName?: string;
  topK?: number;
  filter?: RAGFilter;
  includeMetadata?: boolean;
  maxContextTokens?: number;
}

/**
 * Retrieve relevant documents for a query using RAG
 * @param query User query
 * @param options Retrieval options
 * @returns RAG query result
 */
export async function retrieveRelevantDocuments(
  query: string,
  options: RAGOptions = {}
): Promise<RAGResult> {
  const {
    indexName = DEFAULT_INDEX_NAME,
    topK = DEFAULT_TOP_K,
    filter,
    includeMetadata = true,
    maxContextTokens = 4000,
  } = options;
  
  // Generate embedding for the query
  const queryEmbedding = await getEmbedding(query);
  
  // Query the vector database
  const queryResult = await queryVectors(
    indexName,
    queryEmbedding,
    topK,
    filter,
    includeMetadata
  );
  
  // Extract documents from query results
  const documents: Document[] = queryResult.matches.map(match => ({
    id: match.id,
    content: match.metadata?.content || '',
    metadata: {
      ...match.metadata,
      score: match.score,
    },
  }));
  
  // Sort documents by score (highest first)
  documents.sort((a, b) => (b.metadata.score || 0) - (a.metadata.score || 0));
  
  // Combine document content into a single context
  const combinedContext = documents
    .map(doc => {
      // Format document with metadata
      const { subject, grade, type, tags } = doc.metadata;
      
      // Create header with metadata if available
      let header = '';
      if (subject || grade || type) {
        header = `[${[
          subject ? `Subject: ${subject}` : '',
          grade ? `Grade: ${grade}` : '',
          type ? `Type: ${type}` : '',
          tags ? `Tags: ${tags.join(', ')}` : '',
        ].filter(Boolean).join(' | ')}]\n\n`;
      }
      
      return `${header}${doc.content}`;
    })
    .join('\n\n---\n\n');
  
  // Truncate context to fit within token limit
  const truncatedContext = truncateToTokenLimit(combinedContext, maxContextTokens);
  
  return {
    query,
    documents,
    context: truncatedContext,
  };
}

/**
 * Generate a prompt with retrieved context
 * @param query User query
 * @param context Retrieved context
 * @param systemPrompt System prompt template
 * @returns Full prompt with context
 */
export function generateRAGPrompt(
  query: string,
  context: string,
  systemPrompt: string = 'You are an AI teaching assistant helping educators create teaching materials.'
): string {
  return `${systemPrompt}

Here is relevant information to help answer the query:

${context}

User query: ${query}

Please provide a helpful, accurate response based on the information above. If the information doesn't contain enough details to answer the query completely, say so and provide the best response you can with the available information.`;
}

/**
 * Filter documents by criteria
 * @param documents Array of documents
 * @param filter Filter criteria
 * @returns Filtered documents
 */
export function filterDocuments(documents: Document[], filter: RAGFilter): Document[] {
  return documents.filter(doc => {
    for (const [key, value] of Object.entries(filter)) {
      if (Array.isArray(value)) {
        // For array values (like tags), check for any overlap
        const docValue = doc.metadata[key];
        if (!Array.isArray(docValue) || !value.some(v => docValue.includes(v))) {
          return false;
        }
      } else if (doc.metadata[key] !== value) {
        return false;
      }
    }
    return true;
  });
} 