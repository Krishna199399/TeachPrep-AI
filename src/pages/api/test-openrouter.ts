import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

// OpenRouter API key
const OPENROUTER_API_KEY = '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';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing OpenRouter API connectivity...');

    // Options for the request
    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/models', // Just get the list of models as a test
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://teachprep.ai',
        'X-Title': 'TeachPrep AI Platform'
      }
    };
    
    return new Promise<void>((resolve) => {
      const proxyReq = https.request(options, (proxyRes) => {
        let data = '';
        
        proxyRes.on('data', (chunk) => {
          data += chunk;
        });
        
        proxyRes.on('end', () => {
          const statusCode = proxyRes.statusCode || 500;
          console.log(`OpenRouter API test status: ${statusCode}`);
          
          try {
            // Try to parse as JSON
            const jsonData = JSON.parse(data);
            console.log('OpenRouter API test successful');
            res.status(statusCode).json({
              success: statusCode >= 200 && statusCode < 300,
              statusCode,
              response: jsonData
            });
          } catch (e) {
            // If not valid JSON, return as text
            console.error('Error parsing OpenRouter API response:', e);
            res.status(statusCode).json({
              success: false,
              statusCode,
              error: 'Invalid JSON response',
              response: data
            });
          }
          
          resolve();
        });
      });
      
      proxyReq.on('error', (error) => {
        console.error('OpenRouter API test error:', error);
        res.status(500).json({
          success: false,
          error: 'Connection error',
          details: error.message
        });
        resolve();
      });
      
      proxyReq.end();
    });
  } catch (error: any) {
    console.error('Error in OpenRouter API test:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
} 