import type { NextApiRequest, NextApiResponse } from 'next';

// OpenRouter API key and configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'openai/gpt-3.5-turbo'; // Using 3.5-turbo as equivalent for text-davinci-003

// For local/mock operation when API is not available
const USE_MOCK_DATA = false; // Set to false to use real API

type Data = {
  response: string;
  error?: string;
};

// Generate mock response when API is unavailable
function generateMockResponse(prompt: string): string {
  console.log("Using mock response due to API unavailability");
  return `This is a mock response for your prompt: "${prompt.substring(0, 50)}..."\n\nHere is some educational information that might be helpful for teachers...`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ response: '', error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ response: '', error: 'Prompt is required' });
    }

    let responseText: string;
    
    if (USE_MOCK_DATA) {
      responseText = generateMockResponse(prompt);
    } else {
      try {
        // Use fetch API to directly call OpenRouter via proxy
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
                  content: `You are an AI assistant for teachers, helping them create effective lesson plans, 
                  engaging classroom activities, and assessment materials. 
                  Provide practical, grade-appropriate advice.`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 500,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenRouter API error: ${errorText}`);
          throw new Error(`OpenRouter API error: ${errorText}`);
        }

        const data = await response.json();
        responseText = data.choices[0]?.message?.content || 'No response generated';
      } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        responseText = generateMockResponse(prompt);
      }
    }

    res.status(200).json({ response: responseText });
  } catch (error: any) {
    console.error('Error generating response:', error);
    
    res.status(500).json({
      response: '',
      error: error.message || 'An error occurred during your request.',
    });
  }
} 