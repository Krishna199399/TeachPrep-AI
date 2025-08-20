/**
 * Utility functions for counting tokens and optimizing token usage
 */

// Token counting constants
const GPT_3_5_TURBO_ENCODING_RATIO = 4.0; // approx chars per token
const GPT_4_ENCODING_RATIO = 3.75; // approx chars per token
const DEFAULT_ENCODING_RATIO = 4.0; // default char/token ratio

/**
 * Token count models
 */
export enum TokenCountModel {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo-preview',
  DEFAULT = 'default',
}

/**
 * Estimate token count for text using character ratio approximation
 * This is a rough estimate and should not be used for precise token counting
 * @param text The text to count tokens for
 * @param model The model to use for token counting
 * @returns Estimated token count
 */
export function estimateTokenCount(
  text: string,
  model: TokenCountModel = TokenCountModel.DEFAULT
): number {
  let ratio = DEFAULT_ENCODING_RATIO;
  
  switch (model) {
    case TokenCountModel.GPT_3_5_TURBO:
      ratio = GPT_3_5_TURBO_ENCODING_RATIO;
      break;
    case TokenCountModel.GPT_4:
    case TokenCountModel.GPT_4_TURBO:
      ratio = GPT_4_ENCODING_RATIO;
      break;
  }
  
  return Math.ceil(text.length / ratio);
}

/**
 * Message structure for token counting
 */
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Calculate token count for a conversation
 * @param messages Array of messages in the conversation
 * @param model The model to use for token counting
 * @returns Estimated token count
 */
export function estimateConversationTokens(
  messages: Message[],
  model: TokenCountModel = TokenCountModel.DEFAULT
): number {
  // Base token cost for conversation format
  let tokenCount = 3; // Every reply is primed with <|start|>assistant<|message|>
  
  // Count tokens in each message
  for (const message of messages) {
    // Token cost for message format: 4 tokens for each message
    // role + content + start/end tokens
    tokenCount += 4;
    
    // Add token count for the content
    tokenCount += estimateTokenCount(message.content, model);
  }
  
  return tokenCount;
}

/**
 * Truncate text to fit within a token limit
 * @param text Text to truncate
 * @param maxTokens Maximum tokens allowed
 * @param model Model to use for token estimation
 * @returns Truncated text
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  model: TokenCountModel = TokenCountModel.DEFAULT
): string {
  const estimatedTokens = estimateTokenCount(text, model);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  // Approximate character count based on token limit
  const ratio = maxTokens / estimatedTokens;
  const approxCharLimit = Math.floor(text.length * ratio);
  
  // Try to truncate at natural boundaries
  const truncated = text.substring(0, approxCharLimit);
  
  // Find the last sentence boundary
  const sentenceEndings = ['.', '!', '?'];
  let lastBoundary = -1;
  
  for (const ending of sentenceEndings) {
    const lastIndex = truncated.lastIndexOf(ending);
    if (lastIndex > lastBoundary) {
      lastBoundary = lastIndex;
    }
  }
  
  // If we found a good boundary and it's not too far from the end
  if (lastBoundary > approxCharLimit * 0.8) {
    return truncated.substring(0, lastBoundary + 1);
  }
  
  return truncated;
}

/**
 * Optimize prompt to fit within token limits by removing less important details
 * @param sections Sections of the prompt with priorities
 * @param maxTokens Maximum tokens allowed
 * @param model Model to use for token estimation
 * @returns Optimized prompt
 */
export function optimizePrompt(
  sections: Array<{ text: string; priority: number }>,
  maxTokens: number,
  model: TokenCountModel = TokenCountModel.DEFAULT
): string {
  // Sort sections by priority (higher number = higher priority)
  const sortedSections = [...sections].sort((a, b) => b.priority - a.priority);
  
  let result = '';
  let tokensUsed = 0;
  
  // Add sections in priority order until we hit the token limit
  for (const section of sortedSections) {
    const sectionTokens = estimateTokenCount(section.text, model);
    
    if (tokensUsed + sectionTokens <= maxTokens) {
      // Add the whole section
      result += section.text;
      tokensUsed += sectionTokens;
    } else {
      // Add as much of the section as we can
      const remainingTokens = maxTokens - tokensUsed;
      if (remainingTokens > 0) {
        result += truncateToTokenLimit(section.text, remainingTokens, model);
      }
      break;
    }
  }
  
  return result;
} 