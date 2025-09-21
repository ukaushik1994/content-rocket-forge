import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompleteProposalRequest {
  proposal_id: string;
  content_id?: string;
  content_url?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { proposal_id, content_id, content_url } = await req.json() as CompleteProposalRequest

    if (!proposal_id) {
      return new Response(
        JSON.stringify({ error: 'proposal_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Attempting to complete proposal: ${proposal_id} for user: ${user.id}`)

    // Verify the proposal belongs to the user
    const { data: proposal, error: proposalError } = await supabaseClient
      .from('ai_strategy_proposals')
      .select('id, user_id, status, title')
      .eq('id', proposal_id)
      .eq('user_id', user.id)
      .single()

    if (proposalError || !proposal) {
      console.error('Proposal not found or access denied:', proposalError)
      return new Response(
        JSON.stringify({ error: 'Proposal not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (proposal.status === 'completed') {
      console.log(`Proposal ${proposal_id} is already completed`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Proposal already completed',
          proposal: proposal
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the proposal status to completed
    const { data: updatedProposal, error: updateError } = await supabaseClient
      .from('ai_strategy_proposals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update proposal status:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to complete proposal' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully completed proposal: ${proposal_id}`, updatedProposal)

    // Log the completion event
    try {
      await supabaseClient
        .from('content_activity_log')
        .insert({
          user_id: user.id,
          action: 'proposal_completed_manually',
          content_type: 'ai_strategy_proposal',
          metadata: {
            proposal_id,
            content_id,
            content_url,
            completion_method: 'manual_function_call'
          },
          notes: `Proposal "${proposal.title}" marked as completed manually`,
          module: 'ai_strategy'
        })
    } catch (logError) {
      console.warn('Failed to log completion event:', logError)
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Proposal completed successfully',
        proposal: updatedProposal
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})