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

## Response Format Instructions:
You MUST include structured data in your responses when appropriate:

### For Contextual Actions:
Include actions in this exact JSON format within your response:
\`\`\`json
{
  "actions": [
    {
      "id": "unique-action-id",
      "label": "Action Label", 
      "type": "button",
      "action": "workflow:action-type",
      "data": {}
    }
  ]
}
\`\`\`

### For Visual Data:
Include visual data in this exact JSON format within your response:
\`\`\`json
{
  "visualData": {
    "type": "metrics|chart|workflow|summary",
    "metrics": [
      {
        "id": "metric-id",
        "title": "Metric Title",
        "value": "25%",
        "icon": "TrendingUp",
        "color": "blue"
      }
    ]
  }
}
\`\`\`

### Chart Data Format:
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "chartConfig": {
      "type": "line|bar|pie|area",
      "data": [{"name": "Jan", "value": 100}],
      "categories": ["name"],
      "colors": ["#8b5cf6"]
    }
  }
}
\`\`\`

Generate contextual actions for:
- Content creation and optimization
- SEO analysis and improvements  
- Performance monitoring
- Workflow management
- Strategy implementation

Generate visual data for:
- Performance metrics
- Analytics insights
- Comparative data
- Progress tracking
- Strategic overviews

${context ? `## User Context:\n${JSON.stringify(context, null, 2)}` : ''}

Provide comprehensive, data-driven responses that include relevant actions and visual insights.`;

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

    // If no structured data found, generate some based on query analysis
    if (actions.length === 0 && !visualData) {
      console.log("🎯 Generating contextual actions based on query analysis...");
      
      if (userQuery.toLowerCase().includes('content') || userQuery.toLowerCase().includes('blog') || userQuery.toLowerCase().includes('article')) {
        actions.push({
          id: "create-content",
          label: "Create Content Strategy",
          type: "button",
          action: "workflow:content-creation",
          data: {}
        });
      }
      
      if (userQuery.toLowerCase().includes('seo') || userQuery.toLowerCase().includes('optimize') || userQuery.toLowerCase().includes('search')) {
        actions.push({
          id: "seo-analysis",
          label: "Analyze SEO Opportunities", 
          type: "button",
          action: "workflow:seo-analysis",
          data: {}
        });
        
        visualData = {
          type: "metrics",
          metrics: [
            {
              id: "seo-score",
              title: "Current SEO Score",
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
            }
          ]
        };
      }
      
      if (userQuery.toLowerCase().includes('analytics') || userQuery.toLowerCase().includes('performance') || userQuery.toLowerCase().includes('data')) {
        visualData = {
          type: "chart",
          chartConfig: {
            type: "line",
            data: [
              { name: "Jan", value: 400 },
              { name: "Feb", value: 300 },
              { name: "Mar", value: 600 },
              { name: "Apr", value: 800 },
              { name: "May", value: 750 }
            ],
            categories: ["name"],
            colors: ["#8b5cf6"]
          }
        };
        
        actions.push({
          id: "view-analytics",
          label: "View Detailed Analytics",
          type: "button", 
          action: "workflow:analytics-deep-dive",
          data: {}
        });
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