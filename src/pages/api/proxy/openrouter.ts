import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

// OpenRouter API key
const OPENROUTER_API_KEY = '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';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract request data
    const { endpoint, body } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    // Log the request for debugging
    console.log(`Processing OpenRouter request to endpoint: ${endpoint}`);
    
    // Construct the path - ensure correct format for OpenRouter API
    const apiPath = `/api/v1/${endpoint}`;
    console.log(`OpenRouter API path: ${apiPath}`);

    // Make request to OpenRouter using Node.js https module
    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://teachprep.ai',
        'X-Title': 'TeachPrep AI Platform'
      }
    };
    
    console.log('OpenRouter request options:', JSON.stringify(options, null, 2));
    
    return new Promise<void>((resolve, reject) => {
      const proxyReq = https.request(options, (proxyRes) => {
        let data = '';
        
        proxyRes.on('data', (chunk) => {
          data += chunk;
        });
        
        proxyRes.on('end', () => {
          console.log(`OpenRouter response status: ${proxyRes.statusCode}`);
          
          res.status(proxyRes.statusCode || 500);
          
          // Copy headers
          for (const [key, value] of Object.entries(proxyRes.headers)) {
            if (value) res.setHeader(key, value);
          }
          
          try {
            // Try to parse as JSON first
            const jsonData = JSON.parse(data);
            console.log('OpenRouter response data:', JSON.stringify(jsonData, null, 2));
            res.json(jsonData);
          } catch (e) {
            // If not valid JSON, send as text
            console.log('OpenRouter response (raw):', data);
            res.send(data);
          }
          
          resolve();
        });
      });
      
      proxyReq.on('error', (error) => {
        console.error('OpenRouter API request error:', error);
        res.status(500).json({ error: 'Failed to connect to OpenRouter API' });
        resolve();
      });
      
      // Write request body
      if (body) {
        const requestBody = JSON.stringify(body);
        console.log('OpenRouter request body:', requestBody);
        proxyReq.write(requestBody);
      }
      
      proxyReq.end();
    });
  } catch (error) {
    console.error('Error in OpenRouter proxy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 