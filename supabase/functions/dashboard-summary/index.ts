import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Generating dashboard summary for user: ${user.id}`)

    // Get current month's first day
    const currentDate = new Date()
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthKey = currentMonth.toISOString().split('T')[0]

    // 1. Get content creation activity for the past 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activityData } = await supabase
      .from('content_activity_log')
      .select('content_type, action, timestamp')
      .eq('user_id', user.id)
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .eq('action', 'created')

    // Count content by type
    const contentCounts = {
      glossary: 0,
      blog: 0,
      article: 0,
      strategy: 0
    }

    activityData?.forEach(activity => {
      if (contentCounts.hasOwnProperty(activity.content_type)) {
        contentCounts[activity.content_type as keyof typeof contentCounts]++
      }
    })

    console.log('Content counts:', contentCounts)

    // 2. Get user's goals for current month
    const { data: goalData } = await supabase
      .from('content_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', monthKey)
      .maybeSingle()

    const goals = goalData || {
      goal_glossary: 3,
      goal_blog: 4,
      goal_article: 2,
      goal_strategy: 1
    }

    console.log('Goals:', goals)

    // 3. Get top performing content from performance_metrics
    const { data: performanceData } = await supabase
      .from('performance_metrics')
      .select(`
        content_id,
        content_type,
        traffic_last_7d,
        traffic_last_30d
      `)
      .order('traffic_last_7d', { ascending: false })
      .limit(1)

    let topPerformer = null
    if (performanceData && performanceData.length > 0) {
      const topContent = performanceData[0]
      
      // Get the actual content title based on type
      let contentTitle = 'Unknown Content'
      let contentUrl = '#'
      
      if (topContent.content_type === 'blog' || topContent.content_type === 'article') {
        const { data: contentItem } = await supabase
          .from('content_items')
          .select('title, id')
          .eq('id', topContent.content_id)
          .maybeSingle()
        
        if (contentItem) {
          contentTitle = contentItem.title
          contentUrl = `/content-builder/${contentItem.id}`
        }
      } else if (topContent.content_type === 'glossary') {
        const { data: glossaryItem } = await supabase
          .from('glossary_terms')
          .select('term, id')
          .eq('id', topContent.content_id)
          .maybeSingle()
        
        if (glossaryItem) {
          contentTitle = glossaryItem.term
          contentUrl = `/glossary/${glossaryItem.id}`
        }
      }

      topPerformer = {
        title: contentTitle,
        views: topContent.traffic_last_7d,
        type: topContent.content_type,
        url: contentUrl,
        growth: topContent.traffic_last_7d > 0 ? 
          Math.round(((topContent.traffic_last_7d / Math.max(topContent.traffic_last_30d - topContent.traffic_last_7d, 1)) - 1) * 100) : 0
      }
    }

    console.log('Top performer:', topPerformer)

    // 4. Get opportunity suggestions from content_opportunities
    const { data: opportunities } = await supabase
      .from('content_opportunities')
      .select('keyword, search_volume, content_format, priority')
      .eq('user_id', user.id)
      .eq('status', 'new')
      .order('opportunity_score', { ascending: false })
      .limit(3)

    const nextMoves = opportunities?.map(opp => ({
      cluster: opp.keyword,
      type: opp.content_format || 'blog',
      volume: opp.search_volume || 0,
      priority: opp.priority,
      cta: 'Create Brief'
    })) || []

    console.log('Next moves:', nextMoves)

    // 5. Generate encouragement message
    const totalCreated = Object.values(contentCounts).reduce((sum, count) => sum + count, 0)
    const totalGoals = goals.goal_glossary + goals.goal_blog + goals.goal_article + goals.goal_strategy
    const progressPercentage = totalGoals > 0 ? Math.round((totalCreated / totalGoals) * 100) : 0

    let encouragement = "Let's get started with your content strategy!"
    if (progressPercentage >= 100) {
      encouragement = "Outstanding! You've exceeded your monthly goals. Time to set new challenges!"
    } else if (progressPercentage >= 80) {
      encouragement = "You're almost there! Just a few more pieces to complete your monthly goals."
    } else if (progressPercentage >= 50) {
      encouragement = "Great momentum! You're halfway to your monthly content goals."
    } else if (progressPercentage > 0) {
      encouragement = "Good start! Keep the momentum going to reach your monthly targets."
    }

    // 6. Get active alerts
    const { data: alerts } = await supabase
      .from('dashboard_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(5)

    const response = {
      content_created: contentCounts,
      top_performer: topPerformer,
      progress: {
        goal: {
          blog: goals.goal_blog,
          glossary: goals.goal_glossary,
          article: goals.goal_article,
          strategy: goals.goal_strategy
        },
        achieved: contentCounts,
        percentage: progressPercentage
      },
      next_moves: nextMoves,
      encouragement,
      alerts: alerts || [],
      month: monthKey
    }

    console.log('Dashboard summary response:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error generating dashboard summary:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})