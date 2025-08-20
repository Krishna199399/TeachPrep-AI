// Test script to check OpenRouter connectivity
const https = require('https');

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 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',
    'HTTP-Referer': 'https://teachprep.ai',
    'X-Title': 'TeachPrep AI Platform'
  }
};

const postData = JSON.stringify({
  model: 'openai/gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: 'Hello from TeachPrep!'
    }
  ]
});

console.log('Sending request to OpenRouter API...');

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Could not parse response as JSON:');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Error with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();

console.log('Request sent, waiting for response...'); 