import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { charts, context, userQuery } = await req.json();
    
    // Get user from auth token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    
    // Get user's active AI provider
    const { data: providers, error: providerError } = await supabaseAdmin
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true });
    
    if (providerError) {
      console.error('Error fetching AI providers:', providerError);
      throw new Error('Failed to fetch AI provider configuration');
    }
    
    const selectedProvider = providers?.[0];
    if (!selectedProvider) {
      throw new Error('No active AI provider configured. Please set up an AI provider in Settings.');
    }
    
    console.log(`✅ Using ${selectedProvider.provider} for chart analysis`);
    
    // Validate charts have data
    const validCharts = charts?.filter((chart: any) => 
      chart.data && 
      Array.isArray(chart.data) && 
      chart.data.length > 0
    ) || [];
    
    console.log('📊 Chart data validation:', {
      totalCharts: charts?.length || 0,
      validCharts: validCharts.length,
      invalidCharts: (charts?.length || 0) - validCharts.length
    });

    if (validCharts.length === 0) {
      console.warn('⚠️ No valid chart data provided for analysis');
      return new Response(
        JSON.stringify({ 
          error: 'No valid chart data provided for analysis',
          insights: {
            predictions: [],
            anomalies: [{
              type: "Data Quality Issue",
              description: "No data available in charts for analysis. Please ensure your data source is properly configured and contains valid data points.",
              severity: "high"
            }],
            recommendations: [{
              title: "Configure Data Source",
              description: "Set up a valid data source with actual data to enable chart analysis and insights",
              impact: "Enable data-driven insights and recommendations"
            }],
            trends: []
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Prepare data summary for AI (only from valid charts)
    const dataSummary = validCharts.map((chart: any, idx: number) => {
      const dataPoints = chart.data?.length || 0;
      const dataKeys = chart.data?.[0] ? Object.keys(chart.data[0]) : [];
      
      return {
        chartIndex: idx,
        title: chart.title,
        type: chart.type,
        dataPoints,
        columns: dataKeys,
        sampleData: chart.data?.slice(0, 3) || []
      };
    });

    const systemPrompt = `You are an expert data analyst AI. Analyze the provided chart data and return actionable insights in JSON format.

You must return a valid JSON object with this exact structure:
{
  "predictions": ["prediction 1", "prediction 2", "prediction 3"],
  "anomalies": [
    {
      "type": "Anomaly Type",
      "description": "Description of the anomaly",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation Title",
      "description": "Detailed recommendation",
      "impact": "Expected impact (e.g., +25% traffic)"
    }
  ],
  "trends": ["trend 1", "trend 2", "trend 3"]
}

Guidelines:
- Predictions: 3 forward-looking insights based on data patterns
- Anomalies: Identify outliers, unusual patterns, or data quality issues
- Recommendations: 3 specific, actionable items with estimated impact
- Trends: Key patterns visible in the data

Be specific, quantitative when possible, and business-focused.`;

    const userPrompt = `Analyze these charts:

${JSON.stringify(dataSummary, null, 2)}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}
${userQuery ? `User question: ${userQuery}` : ''}

Return your analysis as a valid JSON object following the required structure.`;

    console.log(`Calling ${selectedProvider.provider} for chart analysis...`);

    const { data: aiResponse, error: aiError } = await supabaseAdmin.functions.invoke('ai-proxy', {
      body: {
        service: selectedProvider.provider,
        endpoint: 'chat',
        apiKey: selectedProvider.api_key,
        params: {
          model: selectedProvider.preferred_model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500
        }
      }
    });

    if (aiError) {
      console.error('AI API error:', aiError);
      throw new Error(`AI API error: ${aiError.message || 'Unknown error'}`);
    }

    // Extract content from response
    const content = aiResponse?.choices?.[0]?.message?.content ||
                   aiResponse?.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse AI response - handle both JSON and text responses
    let insights;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/```\s*(\{[\s\S]*\})\s*```/);
      
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[1]);
      } else {
        insights = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Content:', content);
      
      // Fallback: Return structured error with partial insights
      insights = {
        predictions: [`Analysis generated but formatting error occurred`],
        anomalies: [],
        recommendations: [
          {
            title: "Review Data Quality",
            description: "The AI analysis completed but encountered a formatting issue. Try regenerating insights.",
            impact: "Improved analysis accuracy"
          }
        ],
        trends: []
      };
    }

    // Validate structure
    if (!insights.predictions || !Array.isArray(insights.predictions)) {
      insights.predictions = [];
    }
    if (!insights.anomalies || !Array.isArray(insights.anomalies)) {
      insights.anomalies = [];
    }
    if (!insights.recommendations || !Array.isArray(insights.recommendations)) {
      insights.recommendations = [];
    }
    if (!insights.trends || !Array.isArray(insights.trends)) {
      insights.trends = [];
    }

    console.log('Validated insights:', insights);

    return new Response(
      JSON.stringify({ insights }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in analyze-chart-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze chart data',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
