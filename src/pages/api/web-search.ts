import type { NextApiRequest, NextApiResponse } from 'next';

type WebSearchResponse = {
  snippets: string[];
  urls: string[];
  title?: string;
};

type ErrorResponse = {
  error: string;
};

// Fallback data when API is not available
const getFallbackData = (query: string): WebSearchResponse => {
  // Extract the main topic from the query
  const topicMatch = query.match(/^(.*?)\s+lesson\s+plan/i);
  const topic = topicMatch && topicMatch[1] ? topicMatch[1].trim() : query.split(' ')[0];
  
  return {
    snippets: [
      `${topic} is an important educational concept that helps students develop critical thinking and problem-solving skills.`,
      `When teaching ${topic}, it's essential to provide hands-on activities and real-world examples.`,
      `${topic} concepts should be introduced gradually, building on students' prior knowledge.`,
      `Assessment of ${topic} understanding can include both formative and summative approaches.`,
      `Research shows that students learn ${topic} best through active engagement and collaborative learning.`
    ],
    urls: [
      `https://www.example.com/educational-resources/${topic.toLowerCase().replace(/\s+/g, '-')}`,
      `https://www.teachingresources.org/${topic.toLowerCase().replace(/\s+/g, '-')}-lesson-plans`,
      `https://www.educationalstudies.org/research-on-${topic.toLowerCase().replace(/\s+/g, '-')}`,
    ],
    title: `${topic} Lesson Plan Resources`
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebSearchResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // If we had an actual API key, we would use it here
    // const apiKey = process.env.SEARCH_API_KEY;
    
    // In a real implementation, we would make a request to a search API
    // const response = await fetch(`https://api.search.com/v1/search?q=${encodeURIComponent(q)}&key=${apiKey}`);
    // const data = await response.json();
    
    // But for now, we'll use fallback data
    const fallbackData = getFallbackData(q);
    
    return res.status(200).json(fallbackData);
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Failed to fetch search results' });
  }
} 