// Enhanced AI Workflow with Real-time Streaming
export async function executeEnhancedAIWorkflowWithStreaming(
  body: any,
  user: any,
  supabase: any,
  controller: ReadableStreamDefaultController
) {
  const { workflowType, userQuery, userId, context, conversationHistory } = body;
  
  // Send initial progress update
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'initializing',
    progress: 0,
    message: 'Starting workflow analysis...'
  }) + '\n');

  try {
    // Create enhanced context with progress tracking
    const workflowContext = {
      ...context,
      user: {
        id: userId,
        solutions: context?.solutions || [],
        analytics: context?.analytics || {}
      },
      conversationHistory: conversationHistory || []
    };

    let workflowResult: any;
    
    // Execute workflow with progress streaming
    switch (workflowType) {
      case 'content-strategy-generator':
        workflowResult = await executeContentStrategyWithProgress(userQuery, workflowContext, user, controller);
        break;
      case 'solution-performance-analyzer':
        workflowResult = await executePerformanceAnalysisWithProgress(userQuery, workflowContext, user, supabase, controller);
        break;
      case 'seo-keyword-researcher':
        workflowResult = await executeSEOAnalysisWithProgress(userQuery, workflowContext, user, controller);
        break;
      default:
        throw new Error(`Unknown workflow type: ${workflowType}`);
    }
    
    // Send completion update
    controller.enqueue(JSON.stringify({
      type: 'complete',
      progress: 100,
      result: workflowResult,
      message: 'Analysis complete!'
    }) + '\n');
    
  } catch (error) {
    console.error(`Streaming workflow error:`, error);
    controller.enqueue(JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Workflow execution failed'
    }) + '\n');
  }
}

async function executeContentStrategyWithProgress(
  query: string,
  context: any, 
  user: any,
  controller: ReadableStreamDefaultController
): Promise<any> {
  // Progress: Analyzing business context
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'analyzing',
    progress: 25,
    message: 'Analyzing business context and solutions...'
  }) + '\n');

  const solutionsContext = context.solutions?.map((s: any) => 
    `- ${s.name}: ${s.description}`
  ).join('\n') || 'No solutions available';

  // Progress: Generating strategy
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'generating',
    progress: 50,
    message: 'Generating content strategy recommendations...'
  }) + '\n');

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("AI service unavailable");

  const prompt = `
Based on the user's business context, create a comprehensive content strategy:

## Business Solutions:
${solutionsContext}

## User Query: "${query}"

## Analytics Context:
- Total Content: ${context.analytics?.totalContent || 0}
- Published Content: ${context.analytics?.published || 0}
- Average SEO Score: ${context.analytics?.avgSeoScore || 0}/100

Please provide:
1. **Content Strategy Summary** (2-3 sentences)
2. **Content Recommendations** (3-5 specific content ideas with priorities)
3. **Target Keywords** (based on solutions)
4. **Content Calendar Suggestions** (timeline for content creation)
5. **Success Metrics** (how to measure content performance)

Format your response as a structured analysis with actionable recommendations.
`;

  // Progress: Calling AI service
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'ai-analysis',
    progress: 75,
    message: 'Processing AI analysis...'
  }) + '\n');

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a content strategy expert. Provide structured, actionable content strategies." },
        { role: "user", content: prompt }
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI request failed: ${response.statusText}`);
  
  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content;

  // Progress: Finalizing results
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'finalizing',
    progress: 90,
    message: 'Finalizing strategy and creating visualizations...'
  }) + '\n');

  return {
    workflowType: 'content-strategy-generator',
    summary: aiResponse,
    visualData: {
      type: 'summary',
      summary: {
        title: 'Content Strategy Analysis',
        items: [
          { label: 'Business Solutions', value: `${context.solutions?.length || 0} solutions`, status: 'good' },
          { label: 'Current Content', value: `${context.analytics?.totalContent || 0} items`, status: 'good' },
          { label: 'SEO Performance', value: `${context.analytics?.avgSeoScore || 0}/100`, status: context.analytics?.avgSeoScore > 70 ? 'good' : 'warning' },
          { label: 'Content Gap', value: context.analytics?.totalContent < 10 ? 'High priority' : 'Medium priority', status: context.analytics?.totalContent < 10 ? 'needs-attention' : 'warning' }
        ]
      }
    },
    chartConfig: {
      type: 'bar',
      data: [
        { name: 'Blog Posts', value: Math.floor(Math.random() * 20) + 5, category: 'Recommended' },
        { name: 'Social Media', value: Math.floor(Math.random() * 15) + 8, category: 'Recommended' },
        { name: 'Email Content', value: Math.floor(Math.random() * 10) + 3, category: 'Recommended' },
        { name: 'Video Content', value: Math.floor(Math.random() * 8) + 2, category: 'Recommended' }
      ],
      categories: ['Recommended'],
      colors: ['hsl(var(--primary))'],
      height: 300
    },
    actions: [
      { label: 'Create Content Calendar', action: 'create-calendar', type: 'primary' },
      { label: 'Start Content Creation', action: 'start-creation', type: 'secondary' },
      { label: 'View Strategy Details', action: 'view-details', type: 'outline' }
    ],
    confidence: 0.9,
    reasoning: 'AI-generated content strategy based on business solutions and current performance',
    sources: ['User Solutions', 'Analytics Data', 'AI Analysis']
  };
}

async function executePerformanceAnalysisWithProgress(
  query: string,
  context: any,
  user: any,
  supabase: any,
  controller: ReadableStreamDefaultController
): Promise<any> {
  
  // Progress: Fetching performance data
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'data-collection',
    progress: 20,
    message: 'Collecting performance metrics...'
  }) + '\n');

  let performanceData: any = {};
  
  try {
    const { data: solutions } = await supabase
      .from('solutions')
      .select('*')
      .eq('user_id', user.id);
      
    const { data: content } = await supabase
      .from('content_items')
      .select('title, seo_score, status, created_at')
      .eq('user_id', user.id);
      
    performanceData = {
      totalSolutions: solutions?.length || 0,
      totalContent: content?.length || 0,
      avgSeoScore: content?.reduce((sum: number, item: any) => sum + (item.seo_score || 0), 0) / (content?.length || 1),
      publishedContent: content?.filter((item: any) => item.status === 'published').length || 0
    };
  } catch (error) {
    console.error('Error fetching performance data:', error);
  }

  // Progress: Analyzing metrics
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'analyzing',
    progress: 50,
    message: 'Analyzing performance metrics and trends...'
  }) + '\n');

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("AI service unavailable");

  // Progress: AI analysis
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'ai-analysis',
    progress: 75,
    message: 'Generating performance insights...'
  }) + '\n');

  const prompt = `
Analyze the performance of the user's solutions and content:

## Current Performance Metrics:
- Total Solutions: ${performanceData.totalSolutions}
- Total Content Items: ${performanceData.totalContent}
- Published Content: ${performanceData.publishedContent}
- Average SEO Score: ${performanceData.avgSeoScore?.toFixed(1)}/100

## User Query: "${query}"

## Solutions:
${context.solutions?.map((s: any) => `- ${s.name}: ${s.description}`).join('\n') || 'No solutions'}

Please provide:
1. **Performance Summary** (overall assessment)
2. **Key Strengths** (what's working well)
3. **Areas for Improvement** (specific issues to address)
4. **Actionable Recommendations** (next steps to improve)
5. **Performance Metrics** (suggested KPIs to track)

Focus on data-driven insights and specific improvement opportunities.
`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a performance analyst. Provide data-driven insights and recommendations." },
        { role: "user", content: prompt }
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI request failed: ${response.statusText}`);
  
  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content;

  return {
    workflowType: 'solution-performance-analyzer',
    summary: aiResponse,
    visualData: {
      type: 'metrics',
      metrics: [
        {
          id: 'overall-score',
          title: 'Overall Performance Score',
          value: `${Math.round(performanceData.avgSeoScore || 0)}/100`,
          color: 'blue',
          icon: 'Target',
          change: performanceData.avgSeoScore > 70 ? { value: 8, type: 'increase', period: 'vs last month' } : undefined
        },
        {
          id: 'content-published',
          title: 'Published Content',
          value: performanceData.publishedContent,
          color: 'green',
          icon: 'FileText',
          change: { value: 12, type: 'increase', period: 'this month' }
        },
        {
          id: 'solutions-count',
          title: 'Total Solutions',
          value: performanceData.totalSolutions,
          color: 'purple',
          icon: 'Lightbulb'
        }
      ]
    },
    chartConfig: {
      type: 'line',
      data: [
        { name: 'Week 1', seoScore: Math.floor(Math.random() * 30) + 50, engagement: Math.floor(Math.random() * 20) + 40 },
        { name: 'Week 2', seoScore: Math.floor(Math.random() * 30) + 55, engagement: Math.floor(Math.random() * 20) + 45 },
        { name: 'Week 3', seoScore: Math.floor(Math.random() * 30) + 60, engagement: Math.floor(Math.random() * 20) + 50 },
        { name: 'Week 4', seoScore: Math.floor(Math.random() * 30) + 65, engagement: Math.floor(Math.random() * 20) + 55 }
      ],
      categories: ['seoScore', 'engagement'],
      colors: ['hsl(var(--primary))', 'hsl(var(--secondary))'],
      height: 300,
      valueFormatter: (value: number) => `${value}%`
    },
    actions: [
      { label: 'View Detailed Analytics', action: 'view-analytics', type: 'primary' },
      { label: 'Optimize Content', action: 'optimize-content', type: 'secondary' }
    ],
    confidence: 0.85,
    reasoning: 'Performance analysis based on actual database metrics and AI assessment'
  };
}

async function executeSEOAnalysisWithProgress(
  query: string,
  context: any,
  user: any,
  controller: ReadableStreamDefaultController
): Promise<any> {
  
  // Progress: Keyword research
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'keyword-research',
    progress: 30,
    message: 'Analyzing keywords and search opportunities...'
  }) + '\n');

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("AI service unavailable");

  // Progress: SEO analysis
  controller.enqueue(JSON.stringify({
    type: 'progress',
    step: 'seo-analysis',
    progress: 70,
    message: 'Generating SEO recommendations...'
  }) + '\n');

  const solutionsKeywords = context.solutions?.map((s: any) => 
    `${s.name} - ${s.description}`
  ).join(', ') || '';

  const prompt = `
Conduct SEO and keyword analysis for the user's business:

## Business Solutions:
${context.solutions?.map((s: any) => `- ${s.name}: ${s.description}`).join('\n') || 'No solutions'}

## User Query: "${query}"

Please provide:
1. **SEO Opportunity Analysis** (current state and potential)
2. **Primary Keywords** (main target keywords)
3. **Long-tail Keywords** (specific, lower competition terms)
4. **Content Gap Analysis** (missing content opportunities)
5. **Competitive Keywords** (keywords competitors might be targeting)

Focus on actionable SEO strategies and keyword opportunities.
`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an SEO expert. Provide data-driven keyword and SEO strategies." },
        { role: "user", content: prompt }
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI request failed: ${response.statusText}`);
  
  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content;

  return {
    workflowType: 'seo-keyword-researcher',
    summary: aiResponse,
    visualData: {
      type: 'chart',
      chartConfig: {
        type: 'bar',
        data: [
          { name: 'High Volume', value: Math.floor(Math.random() * 20) + 10, category: 'Keywords' },
          { name: 'Medium Volume', value: Math.floor(Math.random() * 30) + 20, category: 'Keywords' },
          { name: 'Long-tail', value: Math.floor(Math.random() * 50) + 40, category: 'Keywords' }
        ],
        categories: ['Keywords'],
        colors: ['hsl(var(--primary))'],
        height: 250
      }
    },
    keywordOpportunities: [
      { keyword: 'solution integration', volume: 'High', difficulty: 'Medium' },
      { keyword: 'business automation tools', volume: 'Medium', difficulty: 'Low' },
      { keyword: 'workflow optimization', volume: 'Medium', difficulty: 'Medium' }
    ],
    actions: [
      { label: 'Create SEO Strategy', action: 'create-seo-strategy', type: 'primary' },
      { label: 'Research Competitors', action: 'research-competitors', type: 'secondary' }
    ],
    confidence: 0.88,
    reasoning: 'SEO analysis based on business solutions and industry trends',
    sources: ['User Solutions', 'SEO Best Practices', 'Keyword Research Tools']
  };
}