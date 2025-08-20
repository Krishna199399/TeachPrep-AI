import type { NextApiRequest, NextApiResponse } from 'next';
import { retrieveRelevantDocuments, generateRAGPrompt } from '@/utils/rag/retriever';
import { withCache } from '@/middleware/cacheMiddleware';
import { z } from 'zod';

// OpenRouter API key and configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'openai/gpt-4-turbo';

// For local/mock operation when API is not available
const USE_MOCK_DATA = false; // Set to false to use real API

// Request schema validation
const RequestSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
  subject: z.string().optional(),
  grade: z.string().optional(),
  responseFormat: z.enum(['text', 'json']).optional(),
  maxTokens: z.number().positive().optional(),
});

type ResponseData = {
  answer: string;
  sources?: Array<{
    id: string;
    content: string;
    metadata: Record<string, any>;
  }>;
  error?: string;
};

// Generate mock response for when API is unavailable
function generateMockResponse(query: string, isJson: boolean = false): string {
  console.log("Using mock response due to API unavailability");
  
  if (isJson) {
    return JSON.stringify({
      title: "Mock Response",
      content: `This is a mock response for the query: "${query}"`,
      items: ["Item 1", "Item 2", "Item 3"]
    });
  }
  
  return `This is a mock response for the query: "${query}"\n\nHere is some educational information that might be helpful...`;
}

/**
 * API handler for RAG queries
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      answer: '', 
      error: 'Method not allowed. Please use POST.' 
    });
  }

  try {
    // Validate request body
    const validationResult = RequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        answer: '',
        error: validationResult.error.errors.map(e => e.message).join(', '),
      });
    }
    
    const { query, subject, grade, responseFormat = 'text', maxTokens = 1000 } = validationResult.data;
    
    // Prepare filter
    const filter: Record<string, any> = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;

    // Retrieve relevant documents
    const ragResult = await retrieveRelevantDocuments(query, {
      filter,
      topK: 3, // Limit to 3 most relevant documents
      maxContextTokens: 2000, // Limit context size
    });
    
    // Generate full prompt with context
    const prompt = generateRAGPrompt(query, ragResult.context);
    
    let answer: string;
    
    if (USE_MOCK_DATA) {
      answer = generateMockResponse(query, responseFormat === 'json');
    } else {
      try {
        // Generate answer using OpenRouter API via proxy
        const response = await fetch('/api/proxy/openrouter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: 'chat/completions',
            body: {
              model: OPENROUTER_MODEL,
              messages: [
                {
                  role: 'system',
                  content: 'You are an AI teaching assistant helping educators create teaching materials. Provide focused, accurate, and helpful responses.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: maxTokens,
              temperature: 0.7,
              response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
            }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenRouter API error: ${errorText}`);
          throw new Error(`OpenRouter API error: ${errorText}`);
        }
        
        const completion = await response.json();
        answer = completion.choices[0]?.message?.content || 'No response generated';
      } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        answer = generateMockResponse(query, responseFormat === 'json');
      }
    }
    
    // Format sources for response
    const sources = ragResult.documents.map(doc => ({
      id: doc.id,
      content: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''),
      metadata: doc.metadata,
    }));

    // Return the answer with sources
    return res.status(200).json({
      answer,
      sources,
    });
  } catch (error: any) {
    console.error('Error in RAG query:', error);
    
    return res.status(500).json({
      answer: '',
      error: error.message || 'An error occurred processing your request',
    });
  }
}

// Apply caching middleware
export default withCache({
  ttl: 3600, // Cache for 1 hour
  shouldCache: (req) => req.method === 'POST', // Cache POST requests
  cacheKeyGenerator: (req) => {
    // Generate cache key based on query and filters
    const { query, subject, grade } = req.body || {};
    return `rag:${query}:${subject || ''}:${grade || ''}`;
  },
})(handler); 