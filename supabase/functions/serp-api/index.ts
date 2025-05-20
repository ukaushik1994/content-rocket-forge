
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client for administrative tasks like accessing secrets
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// SERP API endpoint base
const SERP_API_BASE = 'https://api.serphouse.com/serp'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Parse request body
    const body = await req.json()
    const { endpoint, params, apiKey: clientApiKey } = body

    console.log(`Processing SERP API request for endpoint: ${endpoint}`)

    // Get API key from request or from Supabase secrets
    let apiKey = clientApiKey
    
    if (!apiKey) {
      console.log('No client API key found, checking Supabase secret')
      const { data: secretData, error: secretError } = await supabaseAdmin.functions.fetchSecrets()
      
      if (secretError) {
        console.error('Error fetching secrets:', secretError)
        throw new Error('Failed to retrieve API key from Supabase secrets')
      }
      
      apiKey = secretData?.SERP_API_KEY
      
      if (!apiKey) {
        console.error('No SERP API key found in secrets')
        throw new Error('SERP API key not configured')
      }
    }

    // Handle different types of SERP API endpoints
    let url: string
    let options: RequestInit = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }

    // Construct the appropriate URL based on the requested endpoint
    switch (endpoint) {
      case 'test':
        // For test endpoint, just try a simple request to verify the key
        console.log('Testing SERP API key')
        url = `${SERP_API_BASE}/test`
        break
        
      case 'search':
        // Build query string from params
        const searchParams = new URLSearchParams()
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value))
          })
        }
        url = `${SERP_API_BASE}/search?${searchParams.toString()}`
        break
        
      case 'analyze':
        // Build query string from params
        const analyzeParams = new URLSearchParams()
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            analyzeParams.append(key, String(value))
          })
        }
        url = `${SERP_API_BASE}/analyze?${analyzeParams.toString()}`
        break
        
      case 'related':
        // Build query string from params
        const relatedParams = new URLSearchParams()
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            relatedParams.append(key, String(value))
          })
        }
        url = `${SERP_API_BASE}/related?${relatedParams.toString()}`
        break
        
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`)
    }

    console.log(`Making request to: ${url}`)
    
    // Make the actual request to the SERP API
    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`SERP API error (${response.status}):`, errorText)
      return new Response(
        JSON.stringify({
          success: false,
          message: `SERP API Error (${response.status}): ${errorText}`
        }),
        {
          status: response.status,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // Process the successful response
    const data = await response.json()
    console.log('SERP API request successful')
    
    // Add a success flag for easy client-side checking
    const enhancedData = {
      ...data,
      success: true
    }
    
    return new Response(
      JSON.stringify(enhancedData),
      {
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error processing SERP API request:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message}`
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
