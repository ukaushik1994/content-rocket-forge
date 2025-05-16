
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
      try {
        console.log("Testing SERP API key...");
        
        // First test with account endpoint to get account info
        const url = `https://serpapi.com/account?api_key=${apiKey}`;
        
        console.log("Sending request to SERP API account endpoint...");
        const response = await fetch(url);
        console.log("SERP API test response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("SERP API error response:", errorText);
          
          let errorMessage = `SERP API key invalid: ${response.status} - ${response.statusText}`;
          
          // Check for specific error conditions
          if (response.status === 401) {
            errorMessage = "Invalid SERP API key. Please check that you've entered the correct key.";
          } else if (response.status === 429) {
            errorMessage = "SERP API rate limit exceeded. Your account may have run out of credits.";
          }
          
          return res.status(400).json({ 
            success: false, 
            message: errorMessage,
            details: errorText
          });
        }
        
        const accountData = await response.json();
        console.log("SERP API account test successful:", accountData);
        
        // Next, let's try a simple search to fully verify the key works
        try {
          console.log("Testing SERP API with a search query...");
          const testSearchUrl = `https://serpapi.com/search?q=test&api_key=${apiKey}&num=1`;
          const searchResponse = await fetch(testSearchUrl);
          
          if (!searchResponse.ok) {
            const searchErrorText = await searchResponse.text();
            console.error("SERP API search test failed:", searchErrorText);
            
            return res.status(200).json({ 
              success: true, 
              message: 'SERP API key is valid, but search test failed. Your account may have limited credits.',
              account: accountData,
              searchTestFailed: true
            });
          }
          
          console.log("SERP API search test successful");
        } catch (searchError) {
          console.error("Error during SERP API search test:", searchError);
          // We still consider the key valid if the account check passed
        }
        
        // If we reach here, the key is valid
        return res.status(200).json({ 
          success: true, 
          message: 'SERP API key is valid and active',
          account: accountData
        });
      } catch (error) {
        console.error('Error testing SERP API key:', error);
        return res.status(500).json({
          success: false,
          message: `Error testing SERP API key: ${error.message || 'Network error'}`,
          error: error.toString()
        });
      }
    }

    // Test OpenAI API key
    if (service === 'openai') {
      try {
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
        
        const data = await response.json();
        return res.status(200).json({ 
          success: true, 
          message: 'OpenAI API key is valid' 
        });
      } catch (error) {
        console.error('Error testing OpenAI API key:', error);
        return res.status(500).json({
          success: false,
          message: `Error testing OpenAI API key: ${error.message || 'Network error'}`
        });
      }
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
      message: error.message || 'Failed to test API key',
      error: error.toString()
    });
  }
}
