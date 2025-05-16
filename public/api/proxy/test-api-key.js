
// This is a simple server-side proxy API endpoint that will be
// replaced with a proper Supabase Edge Function in production.
// For development purposes, this allows the app to work without CORS issues.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { service, apiKey } = req.body;

    if (!service || !apiKey) {
      return res.status(400).json({ success: false, message: 'Service and API key are required' });
    }

    // Test SERP API key
    if (service === 'serp') {
      const url = `https://serpapi.com/account?api_key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(400).json({ 
          success: false, 
          message: `SERP API key invalid: ${response.statusText}` 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'SERP API key is valid' 
      });
    }

    // Test OpenAI API key
    if (service === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (!response.ok) {
        return res.status(400).json({ 
          success: false, 
          message: 'OpenAI API key invalid' 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'OpenAI API key is valid' 
      });
    }

    // Default response for unsupported services
    return res.status(400).json({ 
      success: false, 
      message: `Testing for ${service} is not implemented` 
    });
  } catch (error) {
    console.error('Error testing API key:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to test API key' 
    });
  }
}
