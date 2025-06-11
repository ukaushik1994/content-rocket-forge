
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsPreflightRequest } from "../shared/cors.ts";
import { createErrorResponse, createSuccessResponse } from "../shared/errors.ts";
import { getGoogleAccessToken } from "../shared/auth.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { service, endpoint, apiKey } = await req.json();
    
    console.log(`Google Proxy: ${service} - ${endpoint}`);

    if (endpoint === 'test') {
      if (service === 'google-analytics') {
        return await testGoogleAnalyticsKey(apiKey);
      } else if (service === 'google-search-console') {
        return await testGoogleSearchConsoleKey(apiKey);
      } else {
        return createErrorResponse(`Unsupported Google service: ${service}`, 400, service, endpoint);
      }
    } else {
      return createErrorResponse(`Unsupported endpoint: ${endpoint}`, 400, service, endpoint);
    }
  } catch (error: any) {
    return createErrorResponse(error.message || 'Unknown error', 500, 'google-proxy', 'unknown');
  }
});

async function testGoogleAnalyticsKey(apiKey: string) {
  console.log('Testing Google Analytics credentials');
  
  let isServiceAccount = false;
  let credentials = null;
  
  // Check if it's a service account JSON
  try {
    credentials = JSON.parse(apiKey);
    if (credentials.type === 'service_account' && credentials.private_key && credentials.client_email) {
      isServiceAccount = true;
    }
  } catch (e) {
    // Not JSON, assume it's an API key
    isServiceAccount = false;
  }
  
  if (isServiceAccount) {
    // Test service account with Google Analytics Data API v1
    try {
      const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
      const accessToken = await getGoogleAccessToken(credentials, scopes);
      
      // Test with Google Analytics Data API v1 - list accounts
      const response = await fetch(
        'https://analyticsdata.googleapis.com/v1beta/accounts',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        return createSuccessResponse({ 
          success: true, 
          message: 'Google Analytics service account authenticated successfully' 
        });
      } else {
        const errorData = await response.json();
        console.error('GA API error:', errorData);
        
        if (response.status === 403) {
          return createErrorResponse(
            'Google Analytics service account lacks required permissions. Please ensure the service account has Analytics Viewer access.',
            403,
            'google-analytics',
            'test'
          );
        }
        return createErrorResponse(
          errorData.error?.message || 'Google Analytics authentication failed',
          response.status,
          'google-analytics',
          'test'
        );
      }
    } catch (authError: any) {
      console.error('Service account authentication error:', authError);
      return createErrorResponse(
        `Service account authentication failed: ${authError.message}`,
        400,
        'google-analytics',
        'test'
      );
    }
  } else {
    // For simple API keys, provide guidance
    if (!apiKey || apiKey.length < 20) {
      return createErrorResponse(
        'Invalid Google Analytics API key format. For Google Analytics, you typically need a Service Account JSON file, not a simple API key.',
        400,
        'google-analytics',
        'test'
      );
    }
    
    // Try basic API key test (though this is less common for GA)
    try {
      const response = await fetch(
        `https://www.googleapis.com/analytics/v3/management/accounts?key=${apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        return createSuccessResponse({ 
          success: true, 
          message: 'Google Analytics API key connection successful' 
        });
      } else {
        const errorText = await response.text();
        console.error('GA API key test failed:', errorText);
        return createErrorResponse(
          'Google Analytics API key authentication failed. Consider using a Service Account JSON instead.',
          response.status,
          'google-analytics',
          'test'
        );
      }
    } catch (error: any) {
      return createErrorResponse(
        `Google Analytics API key test failed: ${error.message}. Most Google Analytics integrations require Service Account JSON credentials.`,
        500,
        'google-analytics',
        'test'
      );
    }
  }
}

async function testGoogleSearchConsoleKey(apiKey: string) {
  console.log('Testing Google Search Console credentials');
  
  let isServiceAccount = false;
  let credentials = null;
  
  // Check if it's a service account JSON
  try {
    credentials = JSON.parse(apiKey);
    if (credentials.type === 'service_account' && credentials.private_key && credentials.client_email) {
      isServiceAccount = true;
    }
  } catch (e) {
    // Not JSON, assume it's an API key
    isServiceAccount = false;
  }
  
  if (isServiceAccount) {
    // Test service account with Google Search Console API
    try {
      const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
      const accessToken = await getGoogleAccessToken(credentials, scopes);
      
      // Test with Search Console API - list sites
      const response = await fetch(
        'https://searchconsole.googleapis.com/webmasters/v3/sites',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        return createSuccessResponse({ 
          success: true, 
          message: 'Google Search Console service account authenticated successfully' 
        });
      } else {
        const errorData = await response.json();
        console.error('GSC API error:', errorData);
        
        if (response.status === 403) {
          return createErrorResponse(
            'Google Search Console service account lacks required permissions. Please ensure the service account has Search Console access.',
            403,
            'google-search-console',
            'test'
          );
        }
        return createErrorResponse(
          errorData.error?.message || 'Google Search Console authentication failed',
          response.status,
          'google-search-console',
          'test'
        );
      }
    } catch (authError: any) {
      console.error('Service account authentication error:', authError);
      return createErrorResponse(
        `Service account authentication failed: ${authError.message}`,
        400,
        'google-search-console',
        'test'
      );
    }
  } else {
    // For API key, test with Search Console API
    if (!apiKey || apiKey.length < 20) {
      return createErrorResponse(
        'Invalid Google Search Console API key format. For Google Search Console, you typically need a Service Account JSON file, not a simple API key.',
        400,
        'google-search-console',
        'test'
      );
    }
    
    // Try basic API key test (though this is less common for GSC)
    try {
      const response = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites?key=${apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        return createSuccessResponse({ 
          success: true, 
          message: 'Google Search Console API key connection successful' 
        });
      } else {
        const errorText = await response.text();
        console.error('GSC API key test failed:', errorText);
        return createErrorResponse(
          'Google Search Console API key authentication failed. Consider using a Service Account JSON instead.',
          response.status,
          'google-search-console',
          'test'
        );
      }
    } catch (error: any) {
      return createErrorResponse(
        `Google Search Console API key test failed: ${error.message}. Most Google Search Console integrations require Service Account JSON credentials.`,
        500,
        'google-search-console',
        'test'
      );
    }
  }
}
