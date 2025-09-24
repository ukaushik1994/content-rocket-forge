import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonitoringConfig {
  id: string;
  user_id: string;
  keyword: string;
  location: string;
  language: string;
  check_frequency: number;
  is_active: boolean;
  alert_thresholds: {
    position_change: number;
    new_competitors: boolean;
    featured_snippet_loss: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, config_id, user_id } = await req.json();

    switch (action) {
      case 'run_check': {
        if (!config_id) {
          return new Response(
            JSON.stringify({ error: 'config_id is required' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get monitoring config
        const { data: config, error: configError } = await supabaseClient
          .from('serp_monitoring_configs')
          .select('*')
          .eq('id', config_id)
          .single();

        if (configError || !config) {
          console.error('Config fetch error:', configError);
          return new Response(
            JSON.stringify({ error: 'Monitoring config not found' }), 
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await runMonitoringCheck(supabaseClient, config);
        
        return new Response(
          JSON.stringify({ success: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'run_all_user_checks': {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await runAllUserChecks(supabaseClient, user_id);
        
        return new Response(
          JSON.stringify({ checks_completed: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'schedule_monitoring': {
        // This would be called by a cron job or scheduled task
        const result = await runScheduledMonitoring(supabaseClient);
        
        return new Response(
          JSON.stringify({ scheduled_checks: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in serp-monitor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function runMonitoringCheck(supabaseClient: any, config: MonitoringConfig): Promise<boolean> {
  try {
    console.log(`Running monitoring check for keyword: ${config.keyword}`);

    // Call the SERP analysis function
    const { data: serpData, error: serpError } = await supabaseClient.functions.invoke('serp-analysis', {
      body: { 
        keyword: config.keyword, 
        location: config.location,
        language: config.language 
      }
    });

    if (serpError || !serpData) {
      console.error('SERP analysis error:', serpError);
      return false;
    }

    // Get previous check for comparison
    const { data: previousCheck } = await supabaseClient
      .from('serp_monitoring_history')
      .select('*')
      .eq('config_id', config.id)
      .order('check_timestamp', { ascending: false })
      .limit(1)
      .single();

    // Analyze changes
    const changes = analyzeChanges(previousCheck?.serp_data, serpData, config.alert_thresholds);

    // Save monitoring history
    await supabaseClient
      .from('serp_monitoring_history')
      .insert({
        config_id: config.id,
        user_id: config.user_id,
        keyword: config.keyword,
        serp_data: serpData,
        position_changes: changes.position_changes,
        new_competitors: changes.new_competitors,
        lost_competitors: changes.lost_competitors,
        featured_snippet_changes: changes.featured_snippet_changes
      });

    // Create alerts if significant changes detected
    if (changes.hasSignificantChanges) {
      await createAlertsForChanges(supabaseClient, config, changes);
    }

    console.log(`Monitoring check completed for ${config.keyword}:`, {
      hasChanges: changes.hasSignificantChanges,
      positionChanges: changes.position_changes.length,
      newCompetitors: changes.new_competitors.length
    });

    return true;
  } catch (error) {
    console.error('Error in runMonitoringCheck:', error);
    return false;
  }
}

async function runAllUserChecks(supabaseClient: any, userId: string): Promise<number> {
  try {
    // Get all active monitoring configs for the user
    const { data: configs, error } = await supabaseClient
      .from('serp_monitoring_configs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !configs) {
      console.error('Error fetching user configs:', error);
      return 0;
    }

    let completedChecks = 0;
    
    // Process configs in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < configs.length; i += batchSize) {
      const batch = configs.slice(i, i + batchSize);
      
      const batchPromises = batch.map((config: any) => runMonitoringCheck(supabaseClient, config));
      const results = await Promise.all(batchPromises);
      
      completedChecks += results.filter(success => success).length;
      
      // Add delay between batches
      if (i + batchSize < configs.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Completed ${completedChecks} monitoring checks for user ${userId}`);
    return completedChecks;
  } catch (error) {
    console.error('Error in runAllUserChecks:', error);
    return 0;
  }
}

async function runScheduledMonitoring(supabaseClient: any): Promise<number> {
  try {
    console.log('Running scheduled monitoring checks...');
    
    // Get all active configs that are due for a check
    const { data: configs, error } = await supabaseClient
      .from('serp_monitoring_configs')
      .select(`
        *,
        serp_monitoring_history!inner (
          check_timestamp
        )
      `)
      .eq('is_active', true);

    if (error || !configs) {
      console.error('Error fetching configs for scheduled monitoring:', error);
      return 0;
    }

    // Filter configs that need checking based on frequency
    const now = new Date();
    const configsDue = configs.filter((config: any) => {
      const lastCheck = config.serp_monitoring_history?.[0]?.check_timestamp;
      if (!lastCheck) return true; // Never checked before
      
      const timeSinceLastCheck = now.getTime() - new Date(lastCheck).getTime();
      const checkIntervalMs = config.check_frequency * 1000;
      
      return timeSinceLastCheck >= checkIntervalMs;
    });

    console.log(`Found ${configsDue.length} configs due for checking`);

    let completedChecks = 0;
    
    // Process in smaller batches for scheduled checks
    const batchSize = 2;
    for (let i = 0; i < configsDue.length; i += batchSize) {
      const batch = configsDue.slice(i, i + batchSize);
      
      const batchPromises = batch.map((config: any) => runMonitoringCheck(supabaseClient, config));
      const results = await Promise.all(batchPromises);
      
      completedChecks += results.filter(success => success).length;
      
      // Add delay between batches for scheduled checks
      if (i + batchSize < configsDue.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`Scheduled monitoring completed: ${completedChecks} checks`);
    return completedChecks;
  } catch (error) {
    console.error('Error in runScheduledMonitoring:', error);
    return 0;
  }
}

function analyzeChanges(oldSerpData: any, newSerpData: any, thresholds: any) {
  const changes = {
    hasSignificantChanges: false,
    position_changes: [] as any[],
    new_competitors: [] as any[],
    lost_competitors: [] as any[],
    featured_snippet_changes: {} as any
  };

  if (!oldSerpData) {
    return changes;
  }

  // Helper function to extract domain from URL
  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Analyze position changes in organic results
  const oldResults = oldSerpData.serp_blocks?.organic || [];
  const newResults = newSerpData.serp_blocks?.organic || [];

  oldResults.forEach((oldResult: any, oldIndex: number) => {
    const newIndex = newResults.findIndex((r: any) => extractDomain(r.link) === extractDomain(oldResult.link));
    
    if (newIndex === -1) {
      // Competitor lost position
      changes.lost_competitors.push({
        domain: extractDomain(oldResult.link),
        old_position: oldIndex + 1,
        title: oldResult.title
      });
      changes.hasSignificantChanges = true;
    } else if (Math.abs(newIndex - oldIndex) >= thresholds.position_change) {
      // Significant position change
      changes.position_changes.push({
        domain: extractDomain(oldResult.link),
        old_position: oldIndex + 1,
        new_position: newIndex + 1,
        change: newIndex - oldIndex,
        title: oldResult.title
      });
      changes.hasSignificantChanges = true;
    }
  });

  // Find new competitors
  newResults.forEach((newResult: any, newIndex: number) => {
    const existsInOld = oldResults.some((r: any) => extractDomain(r.link) === extractDomain(newResult.link));
    if (!existsInOld && thresholds.new_competitors) {
      changes.new_competitors.push({
        domain: extractDomain(newResult.link),
        position: newIndex + 1,
        title: newResult.title
      });
      changes.hasSignificantChanges = true;
    }
  });

  // Analyze featured snippet changes
  const oldFeatured = oldSerpData.featuredSnippets?.[0];
  const newFeatured = newSerpData.featuredSnippets?.[0];

  if (oldFeatured && !newFeatured && thresholds.featured_snippet_loss) {
    changes.featured_snippet_changes = {
      type: 'lost',
      old_domain: extractDomain(oldFeatured.source)
    };
    changes.hasSignificantChanges = true;
  } else if (!oldFeatured && newFeatured) {
    changes.featured_snippet_changes = {
      type: 'gained',
      new_domain: extractDomain(newFeatured.source)
    };
    changes.hasSignificantChanges = true;
  } else if (oldFeatured && newFeatured && extractDomain(oldFeatured.source) !== extractDomain(newFeatured.source)) {
    changes.featured_snippet_changes = {
      type: 'changed',
      old_domain: extractDomain(oldFeatured.source),
      new_domain: extractDomain(newFeatured.source)
    };
    changes.hasSignificantChanges = true;
  }

  return changes;
}

async function createAlertsForChanges(supabaseClient: any, config: MonitoringConfig, changes: any) {
  const alerts = [];

  // Position change alerts
  for (const change of changes.position_changes) {
    const direction = change.change > 0 ? 'dropped' : 'improved';
    const severity = Math.abs(change.change) > 5 ? 'high' : 'medium';
    
    alerts.push({
      user_id: config.user_id,
      config_id: config.id,
      alert_type: 'position_change',
      severity,
      title: `${change.domain} ${direction} for "${config.keyword}"`,
      message: `${change.domain} moved from position ${change.old_position} to ${change.new_position} (${change.change > 0 ? '+' : ''}${change.change})`,
      alert_data: { change, keyword: config.keyword },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // New competitor alerts
  for (const competitor of changes.new_competitors) {
    alerts.push({
      user_id: config.user_id,
      config_id: config.id,
      alert_type: 'new_competitor',
      severity: 'medium',
      title: `New competitor for "${config.keyword}"`,
      message: `${competitor.domain} appeared at position ${competitor.position}`,
      alert_data: { competitor, keyword: config.keyword },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Featured snippet alerts
  if (changes.featured_snippet_changes.type === 'lost') {
    alerts.push({
      user_id: config.user_id,
      config_id: config.id,
      alert_type: 'featured_snippet_loss',
      severity: 'high',
      title: `Featured snippet lost for "${config.keyword}"`,
      message: `${changes.featured_snippet_changes.old_domain} lost the featured snippet`,
      alert_data: { change: changes.featured_snippet_changes, keyword: config.keyword },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Insert alerts
  if (alerts.length > 0) {
    try {
      const { error } = await supabaseClient
        .from('serp_alerts')
        .insert(alerts);
      
      if (error) {
        console.error('Error creating alerts:', error);
      } else {
        console.log(`Created ${alerts.length} alerts for ${config.keyword}`);
      }
    } catch (error) {
      console.error('Error inserting alerts:', error);
    }
  }
}