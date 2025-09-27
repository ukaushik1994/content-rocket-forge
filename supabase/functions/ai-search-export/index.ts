import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, data } = await req.json();
    
    console.log(`🔍 Search & Export: ${action} for user ${userId}`);

    switch (action) {
      case 'search_messages':
        return await searchMessages(userId, data);
      
      case 'semantic_search':
        return await semanticSearch(userId, data);
      
      case 'export_conversation':
        return await exportConversation(userId, data);
      
      case 'export_multiple':
        return await exportMultipleConversations(userId, data);
      
      case 'import_conversation':
        return await importConversation(userId, data);
      
      case 'get_search_history':
        return await getSearchHistory(userId);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in search & export manager:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function searchMessages(userId: string, data: any) {
  const { query, conversationId, filters = {} } = data;
  
  let searchQuery = supabase
    .from('ai_messages')
    .select(`
      *,
      ai_conversations!inner(user_id, title)
    `)
    .eq('ai_conversations.user_id', userId);

  // Add conversation filter
  if (conversationId) {
    searchQuery = searchQuery.eq('conversation_id', conversationId);
  }

  // Add date filters
  if (filters.startDate) {
    searchQuery = searchQuery.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    searchQuery = searchQuery.lte('created_at', filters.endDate);
  }

  // Add message type filter
  if (filters.messageType) {
    searchQuery = searchQuery.eq('type', filters.messageType);
  }

  // Full-text search using PostgreSQL
  if (query) {
    searchQuery = searchQuery.textSearch('content', query);
  }

  // Order and limit
  searchQuery = searchQuery
    .order('created_at', { ascending: false })
    .limit(filters.limit || 50);

  const { data: messages, error } = await searchQuery;

  if (error) throw error;

  // Log search for analytics
  await supabase
    .from('ai_context_state')
    .upsert({
      user_id: userId,
      context: {
        type: 'search_history',
        query,
        filters,
        results_count: messages?.length || 0,
        searched_at: new Date().toISOString()
      }
    });

  return new Response(JSON.stringify({ 
    messages: messages || [],
    totalCount: messages?.length || 0,
    query,
    filters
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function semanticSearch(userId: string, data: any) {
  const { query, conversationId, threshold = 0.7 } = data;
  
  // Get the LOVABLE_API_KEY for embeddings
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY not found");
  }

  // Generate embedding for the search query
  const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: query
    }),
  });

  if (!embeddingResponse.ok) {
    throw new Error(`Embedding API error: ${embeddingResponse.status}`);
  }

  const embeddingData = await embeddingResponse.json();
  const queryEmbedding = embeddingData.data[0].embedding;

  // For now, fall back to text search since we don't have vector embeddings stored
  // In a full implementation, you would:
  // 1. Store message embeddings in a vector column
  // 2. Use pgvector for similarity search
  // 3. Compare against the query embedding

  const { data: messages, error } = await supabase
    .from('ai_messages')
    .select(`
      *,
      ai_conversations!inner(user_id, title)
    `)
    .eq('ai_conversations.user_id', userId)
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return new Response(JSON.stringify({ 
    messages: messages || [],
    query,
    searchType: 'semantic',
    note: 'Vector similarity search would be implemented with pgvector extension'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function exportConversation(userId: string, data: any) {
  const { conversationId, format = 'json', includeMetadata = true } = data;
  
  // Get conversation and messages
  const { data: conversation, error: convError } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convError) throw convError;

  const { data: messages, error: msgError } = await supabase
    .rpc('get_conversation_messages', {
      conv_id: conversationId,
      limit_count: 1000
    });

  if (msgError) throw msgError;

  let exportData;
  const timestamp = new Date().toISOString();

  switch (format) {
    case 'json':
      exportData = {
        conversation,
        messages: messages || [],
        exported_at: timestamp,
        ...(includeMetadata && {
          metadata: {
            total_messages: messages?.length || 0,
            date_range: {
              start: messages?.[messages.length - 1]?.created_at,
              end: messages?.[0]?.created_at
            }
          }
        })
      };
      break;

    case 'markdown':
      exportData = generateMarkdownExport(conversation, messages || [], includeMetadata);
      break;

    case 'csv':
      exportData = generateCSVExport(messages || []);
      break;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return new Response(JSON.stringify({ 
    exportData,
    filename: `conversation-${conversationId}-${timestamp.split('T')[0]}.${format}`,
    format,
    size: JSON.stringify(exportData).length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function exportMultipleConversations(userId: string, data: any) {
  const { conversationIds, format = 'json', includeMetadata = true } = data;
  
  const exports = [];
  
  for (const conversationId of conversationIds) {
    try {
      const result = await exportConversation(userId, { 
        conversationId, 
        format, 
        includeMetadata 
      });
      const exportResult = await result.json();
      exports.push({
        conversationId,
        success: true,
        data: exportResult.exportData
      });
    } catch (error) {
      exports.push({
        conversationId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  return new Response(JSON.stringify({ 
    exports,
    totalCount: exports.length,
    successCount: exports.filter(e => e.success).length,
    format
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function importConversation(userId: string, data: any) {
  const { importData, mergeStrategy = 'new_conversation' } = data;
  
  try {
    // Validate import data structure
    if (!importData.conversation || !importData.messages) {
      throw new Error('Invalid import data structure');
    }

    let conversationId;

    if (mergeStrategy === 'new_conversation') {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          title: importData.conversation.title + ' (Imported)',
          tags: [...(importData.conversation.tags || []), 'imported']
        })
        .select()
        .single();

      if (convError) throw convError;
      conversationId = newConversation.id;
    } else {
      conversationId = data.targetConversationId;
    }

    // Import messages
    const importedMessages = importData.messages.map((msg: any) => ({
      conversation_id: conversationId,
      type: msg.type,
      content: msg.content,
      visual_data: msg.visual_data,
      workflow_context: msg.workflow_context,
      status: 'completed'
    }));

    const { data: messages, error: msgError } = await supabase
      .from('ai_messages')
      .insert(importedMessages)
      .select();

    if (msgError) throw msgError;

    return new Response(JSON.stringify({ 
      conversationId,
      importedMessagesCount: messages?.length || 0,
      message: 'Conversation imported successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getSearchHistory(userId: string) {
  const { data: contextStates, error } = await supabase
    .from('ai_context_state')
    .select('context, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const searchHistory = contextStates
    ?.filter(state => state.context?.type === 'search_history')
    .map(state => ({
      query: state.context.query,
      filters: state.context.filters,
      results_count: state.context.results_count,
      searched_at: state.context.searched_at
    })) || [];

  return new Response(JSON.stringify({ 
    searchHistory,
    totalSearches: searchHistory.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateMarkdownExport(conversation: any, messages: any[], includeMetadata: boolean) {
  let markdown = `# ${conversation.title}\n\n`;
  
  if (includeMetadata) {
    markdown += `**Created:** ${new Date(conversation.created_at).toLocaleDateString()}\n`;
    markdown += `**Messages:** ${messages.length}\n`;
    markdown += `**Tags:** ${conversation.tags?.join(', ') || 'None'}\n\n`;
    markdown += '---\n\n';
  }

  messages.reverse().forEach((msg, index) => {
    const role = msg.type === 'user' ? 'User' : 'Assistant';
    const timestamp = new Date(msg.created_at).toLocaleString();
    
    markdown += `## ${role} - ${timestamp}\n\n`;
    markdown += `${msg.content}\n\n`;
    
    if (msg.visual_data) {
      markdown += `*[Visual data included]*\n\n`;
    }
  });

  return markdown;
}

function generateCSVExport(messages: any[]) {
  const headers = ['timestamp', 'type', 'content', 'has_visual_data', 'message_status'];
  const rows = messages.map(msg => [
    msg.created_at,
    msg.type,
    `"${msg.content.replace(/"/g, '""')}"`,
    !!msg.visual_data,
    msg.message_status || 'sent'
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}