
// This is a simple server-side proxy API endpoint to proxy requests to the SERP API
// For development purposes, this allows the app to work without CORS issues.

export default async function handler(req, res) {
  // Only allow GET requests for simplicity
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, ...queryParams } = req.query;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }
    
    // Construct the SERP API URL
    const searchParams = new URLSearchParams(queryParams);
    const url = `https://serpapi.com/${endpoint}?${searchParams.toString()}`;
    
    console.log(`Proxying request to: ${url}`);
    
    // Forward the request to the SERP API
    const response = await fetch(url);
    
    // If the response is not OK, return an error
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `SERP API returned an error: ${response.statusText}`,
        details: errorText
      });
    }
    
    // Return the response from the SERP API
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying to SERP API:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy request to SERP API',
      message: error.message
    });
  }
}
