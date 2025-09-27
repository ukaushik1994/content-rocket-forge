import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    console.log("🚀 Processing enhanced AI chat request");

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the LOVABLE_API_KEY from environment
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      console.error("LOVABLE_API_KEY not found in environment, please enable the AI gateway");
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze the user query for intent
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content || '';
    
    console.log("🧠 Analyzing query for context:", userQuery);

    // Build enhanced system prompt with context
    const systemPrompt = `You are an intelligent workflow orchestration assistant with deep expertise in content strategy, business solutions, and data analysis.

## Your Capabilities:
- Advanced content analysis and optimization
- Solution integration and positioning  
- Visual data creation (charts, metrics, workflows)
- Strategic recommendations with actionable insights
- Contextual action generation

## CRITICAL: Always Include Visual Data and Actions
For EVERY response, you MUST include AT LEAST ONE of the following:
1. Contextual actions that help the user take next steps
2. Visual data (charts, metrics, or summaries) that illustrate your points
3. Both actions AND visual data when relevant

## Response Format Instructions:
You MUST include structured data in your responses using these exact formats:

### For Contextual Actions (ALWAYS include when recommending next steps):
\`\`\`json
{
  "actions": [
    {
      "id": "unique-action-id",
      "label": "Action Label", 
      "type": "button",
      "action": "workflow:action-type|navigate:path|create-content|keyword-research|content-strategy",
      "data": {}
    }
  ]
}
\`\`\`

### For Visual Data (ALWAYS include for data, performance, analytics):
\`\`\`json
{
  "visualData": {
    "type": "metrics|chart|workflow|summary",
    "metrics": [
      {
        "id": "metric-id",
        "title": "Metric Title",
        "value": "25%",
        "icon": "TrendingUp|Search|BarChart|Users|Calendar",
        "color": "blue|green|purple|orange"
      }
    ]
  }
}
\`\`\`

### Chart Data Format (Use for trends, comparisons, analytics):
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "chartConfig": {
      "type": "line|bar|pie|area",
      "data": [{"name": "Jan", "value": 100}, {"name": "Feb", "value": 150}],
      "categories": ["name"],
      "colors": ["#8b5cf6", "#06b6d4", "#10b981"]
    }
  }
}
\`\`\`

## ALWAYS Generate Actions For:
- Content creation and optimization → "workflow:content-creation" or "create-content"
- SEO analysis and improvements → "workflow:seo-analysis" or "keyword-research"
- Performance monitoring → "workflow:analytics-deep-dive" or "navigate:/analytics"
- Strategy development → "workflow:content-strategy" or "navigate:/strategies"
- Research activities → "keyword-research" or "navigate:/research"

## ALWAYS Generate Visual Data For:
- Performance metrics (use type: "metrics")
- Analytics insights (use type: "chart" with real data)
- Comparative data (use type: "chart" with multiple series)
- Progress tracking (use type: "metrics" with progress indicators)
- Strategic overviews (use type: "summary")

${context ? `## User Context:\n${JSON.stringify(context, null, 2)}` : ''}

Provide comprehensive, data-driven responses that ALWAYS include relevant actions and visual insights. Remember: Every response should help the user take action and understand data visually.`;

    // Call the Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", await response.text());
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      console.error("No response from AI", data);
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the AI response for structured data
    console.log("🔍 Parsing AI response for structured data...");
    
    let actions = [];
    let visualData = null;
    let cleanContent = aiMessage;

    // Extract actions
    const actionMatch = aiMessage.match(/```json\s*\n([\s\S]*?"actions"[\s\S]*?)\n```/);
    if (actionMatch) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        if (actionData.actions) {
          actions = actionData.actions;
          console.log("📋 Found actions data:", JSON.stringify(actions, null, 2));
          cleanContent = cleanContent.replace(actionMatch[0], '').trim();
        }
      } catch (e) {
        console.log("Failed to parse actions:", e);
      }
    }

    // Extract visual data
    const visualMatch = aiMessage.match(/```json\s*\n([\s\S]*?"visualData"[\s\S]*?)\n```/);
    if (visualMatch) {
      try {
        const visualJson = JSON.parse(visualMatch[1]);
        if (visualJson.visualData) {
          visualData = visualJson.visualData;
          console.log("📊 Found visual data:", JSON.stringify(visualData, null, 2));
          cleanContent = cleanContent.replace(visualMatch[0], '').trim();
        }
      } catch (e) {
        console.log("Failed to parse visual data:", e);
      }
    }

    // Enhanced fallback generation with better detection
    if (actions.length === 0 && !visualData) {
      console.log("🎯 Generating enhanced contextual actions and visual data...");
      
      const queryLower = userQuery.toLowerCase();
      
      // Content-related queries
      if (queryLower.includes('content') || queryLower.includes('blog') || queryLower.includes('article') || queryLower.includes('write')) {
        actions.push({
          id: "create-content",
          label: "Create Content Strategy",
          type: "button",
          action: "workflow:content-creation",
          data: {}
        }, {
          id: "content-builder",
          label: "Open Content Builder",
          type: "button",
          action: "navigate:/content-builder",
          data: {}
        });
        
        visualData = {
          type: "metrics",
          metrics: [
            {
              id: "content-performance",
              title: "Content Performance",
              value: "78%",
              icon: "BarChart",
              color: "blue"
            },
            {
              id: "publishing-rate",
              title: "Publishing Rate",
              value: "12/month",
              icon: "Calendar",
              color: "green"
            }
          ]
        };
      }
      
      // SEO and optimization queries
      else if (queryLower.includes('seo') || queryLower.includes('optimize') || queryLower.includes('search') || queryLower.includes('ranking')) {
        actions.push({
          id: "seo-analysis",
          label: "Analyze SEO Opportunities",
          type: "button",
          action: "workflow:seo-analysis",
          data: {}
        }, {
          id: "keyword-research",
          label: "Start Keyword Research",
          type: "button",
          action: "navigate:/research",
          data: {}
        });
        
        visualData = {
          type: "metrics",
          metrics: [
            {
              id: "seo-score",
              title: "Average SEO Score",
              value: "72/100",
              icon: "Search",
              color: "orange"
            },
            {
              id: "keywords-ranking",
              title: "Keywords Ranking",
              value: "156",
              icon: "TrendingUp",
              color: "green"
            },
            {
              id: "traffic-growth",
              title: "Traffic Growth",
              value: "+24%",
              icon: "Users",
              color: "blue"
            }
          ]
        };
      }
      
      // Analytics and performance queries
      else if (queryLower.includes('analytics') || queryLower.includes('performance') || queryLower.includes('data') || queryLower.includes('metric')) {
        actions.push({
          id: "view-analytics",
          label: "View Detailed Analytics",
          type: "button",
          action: "navigate:/analytics",
          data: {}
        }, {
          id: "performance-analysis",
          label: "Run Performance Analysis",
          type: "button",
          action: "workflow:analytics-deep-dive",
          data: {}
        });
        
        visualData = {
          type: "chart",
          chartConfig: {
            type: "line",
            data: [
              { name: "Jan", value: 400 },
              { name: "Feb", value: 300 },
              { name: "Mar", value: 600 },
              { name: "Apr", value: 800 },
              { name: "May", value: 750 },
              { name: "Jun", value: 920 }
            ],
            categories: ["name"],
            colors: ["#8b5cf6", "#06b6d4"]
          }
        };
      }
      
      // Strategy queries
      else if (queryLower.includes('strategy') || queryLower.includes('plan') || queryLower.includes('roadmap')) {
        actions.push({
          id: "content-strategy",
          label: "Develop Content Strategy",
          type: "button",
          action: "navigate:/strategies",
          data: {}
        }, {
          id: "strategy-analysis",
          label: "Analyze Current Strategy",
          type: "button",
          action: "workflow:strategy-analysis",
          data: {}
        });
        
        visualData = {
          type: "summary",
          summary: {
            title: "Strategy Overview",
            items: [
              { label: "Active Strategies", value: "3", status: "good" },
              { label: "Implementation Rate", value: "85%", status: "good" },
              { label: "ROI Tracking", value: "Needs Setup", status: "needs-attention" }
            ]
          }
        };
      }
      
      // Default fallback - always provide something
      else {
        actions.push({
          id: "explore-features",
          label: "Explore Platform Features",
          type: "button",
          action: "navigate:/dashboard",
          data: {}
        }, {
          id: "get-help",
          label: "Get Started Guide",
          type: "button",
          action: "workflow:onboarding-help",
          data: {}
        });
        
        visualData = {
          type: "metrics",
          metrics: [
            {
              id: "platform-usage",
              title: "Platform Usage",
              value: "Active",
              icon: "Users",
              color: "green"
            },
            {
              id: "features-explored",
              title: "Features Explored",
              value: "65%",
              icon: "BarChart",
              color: "blue"
            }
          ]
        };
      }
    }

    console.log(`✅ Parsed response: { hasActions: ${actions.length > 0}, hasVisualData: ${!!visualData}, messageLength: ${cleanContent.length} }`);

    return new Response(JSON.stringify({
      response: cleanContent,
      actions: actions.length > 0 ? actions : undefined,
      visualData: visualData || undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in enhanced AI chat:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});