/**
 * Action Intent Detector
 * 
 * Lightweight utility to detect write-action intent from user messages.
 * Used by useUnifiedChatDB to decide whether to make a secondary
 * call to enhanced-ai-chat for tool execution after streaming completes.
 */

export interface ActionIntent {
  detected: boolean;
  toolName: string;
  confidence: 'high' | 'medium' | 'low';
  params: Record<string, any>;
  requiresConfirmation?: boolean;
}

interface PatternRule {
  patterns: RegExp[];
  toolName: string;
  confidence: 'high' | 'medium';
  requiresConfirmation?: boolean;
  extractParams?: (message: string, match: RegExpMatchArray) => Record<string, any>;
}

/** Tools that require explicit user confirmation before execution */
const DESTRUCTIVE_TOOLS = new Set([
  'delete_content_item',
  'delete_solution',
  'send_email_campaign',
  'send_quick_email',
  'publish_to_website',
  'create_social_post',
  'schedule_social_from_repurpose',
  'delete_contact',
  'delete_segment',
  'delete_email_campaign',
  'delete_journey',
  'delete_automation',
  'delete_social_post',
]);

const ACTION_RULES: PatternRule[] = [
  // Content creation & management
  {
    patterns: [
      /\b(save|store)\s+(this|that|it)\s*(as\s+)?(a\s+)?(draft|blog|post|article|content)/i,
      /\b(create|write|generate)\s+(a\s+)?(new\s+)?(blog\s*post|article|content|draft)/i,
      /\bsave\s+(this|that|it)\b/i,
      /\b(publish|save)\s+(this|the)\s+(blog|post|article|content)/i,
    ],
    toolName: 'create_content_item',
    confidence: 'high',
    extractParams: (msg) => {
      const titleMatch = msg.match(/(?:titled?|called?|named?)\s+["']([^"']+)["']/i);
      return titleMatch ? { title: titleMatch[1] } : {};
    }
  },
  {
    patterns: [
      /\b(update|edit|modify|change)\s+(the\s+)?(content|blog|post|article)/i,
    ],
    toolName: 'update_content_item',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?(content|blog|post|article)/i,
    ],
    toolName: 'delete_content_item',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(submit|send)\s+(for|to)\s+review/i,
    ],
    toolName: 'submit_for_review',
    confidence: 'high',
  },
  {
    patterns: [
      /\bapprove\s+(the\s+)?(content|blog|post|article)/i,
    ],
    toolName: 'approve_content',
    confidence: 'high',
  },
  {
    patterns: [
      /\breject\s+(the\s+)?(content|blog|post|article)/i,
    ],
    toolName: 'reject_content',
    confidence: 'high',
  },
  {
    patterns: [
      /\bgenerate\s+(full\s+)?(content|article|blog)/i,
      /\bwrite\s+(me\s+)?(a\s+)?(full|complete)\s+(article|blog|post)/i,
    ],
    toolName: 'generate_full_content',
    confidence: 'high',
  },

  // Keywords
  {
    patterns: [
      /\badd\s+(the\s+)?keyword/i,
      /\badd\s+["']([^"']+)["']\s+(as\s+)?(a\s+)?keyword/i,
    ],
    toolName: 'add_keywords',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(remove|delete)\s+(the\s+)?keyword/i,
    ],
    toolName: 'remove_keywords',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(run|trigger|do)\s+(a\s+)?serp\s+(analysis|research)/i,
      /\banalyze\s+(the\s+)?serp/i,
    ],
    toolName: 'trigger_serp_analysis',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(create|build|make)\s+(a\s+)?topic\s+cluster/i,
    ],
    toolName: 'create_topic_cluster',
    confidence: 'high',
  },

  // Campaigns
  {
    patterns: [
      /\b(trigger|start|generate)\s+(content\s+)?generation\s+(for|in)\s+(the\s+)?campaign/i,
    ],
    toolName: 'trigger_content_generation',
    confidence: 'high',
  },
  {
    patterns: [
      /\bretry\s+(the\s+)?failed\s+(content|generation)/i,
    ],
    toolName: 'retry_failed_content',
    confidence: 'high',
  },

  // Offerings / Solutions
  {
    patterns: [
      /\b(create|add)\s+(a\s+)?(new\s+)?(solution|offering|product|service)/i,
    ],
    toolName: 'create_solution',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(update|edit|modify)\s+(the\s+)?(solution|offering|product|service)/i,
    ],
    toolName: 'update_solution',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?(solution|offering|product|service)/i,
    ],
    toolName: 'delete_solution',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(add|create)\s+(a\s+)?(new\s+)?competitor/i,
    ],
    toolName: 'add_competitor',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(analyze|research)\s+(the\s+)?competitor/i,
      /\bcompetitor\s+(analysis|research|intelligence)/i,
    ],
    toolName: 'trigger_competitor_analysis',
    confidence: 'medium',
  },

  // Engage - Contacts
  {
    patterns: [
      /\b(create|add)\s+(a\s+)?(new\s+)?contact/i,
    ],
    toolName: 'create_contact',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(update|edit)\s+(the\s+)?contact/i,
    ],
    toolName: 'update_contact',
    confidence: 'high',
  },
  {
    patterns: [
      /\btag\s+(the\s+)?contact/i,
    ],
    toolName: 'tag_contacts',
    confidence: 'high',
  },

  // Engage - Segments
  {
    patterns: [
      /\b(create|build|make)\s+(a\s+)?(new\s+)?segment/i,
    ],
    toolName: 'create_segment',
    confidence: 'high',
  },

  // Engage - Email
  {
    patterns: [
      /\b(create|build|draft)\s+(a\s+)?(new\s+)?email\s+(campaign|newsletter)/i,
    ],
    toolName: 'create_email_campaign',
    confidence: 'high',
  },
  {
    patterns: [
      /\bsend\s+(the\s+)?email\s+(campaign|newsletter)/i,
      /\bsend\s+(the\s+)?campaign/i,
    ],
    toolName: 'send_email_campaign',
    confidence: 'high',
  },
  {
    patterns: [
      /\bsend\s+(a\s+)?quick\s+email/i,
      /\bsend\s+(an?\s+)?email\s+to\b/i,
    ],
    toolName: 'send_quick_email',
    confidence: 'high',
  },

  // Engage - Journeys & Automations
  {
    patterns: [
      /\b(create|build|make)\s+(a\s+)?(new\s+)?journey/i,
    ],
    toolName: 'create_journey',
    confidence: 'high',
  },
  {
    patterns: [
      /\bactivate\s+(the\s+)?journey/i,
    ],
    toolName: 'activate_journey',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(create|build|make)\s+(a\s+)?(new\s+)?automation/i,
    ],
    toolName: 'create_automation',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(toggle|enable|disable)\s+(the\s+)?automation/i,
    ],
    toolName: 'toggle_automation',
    confidence: 'high',
  },
  {
    patterns: [
      /\benroll\s+(contacts?|users?)\s+(in|into)\s+(the\s+)?journey/i,
    ],
    toolName: 'enroll_contacts_in_journey',
    confidence: 'high',
  },

  // Cross-module
  {
    patterns: [
      /\bpromote\s+(this|the)\s+(content|article|blog)\s+to\s+(a\s+)?campaign/i,
    ],
    toolName: 'promote_content_to_campaign',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(convert|turn)\s+(this|the)\s+(content|article|blog)\s+(into|to)\s+(an?\s+)?email/i,
    ],
    toolName: 'content_to_email',
    confidence: 'high',
  },
  {
    patterns: [
      /\brepurpose\s+(this|the|for)\s*(content|article|blog|social)/i,
    ],
    toolName: 'repurpose_for_social',
    confidence: 'medium',
  },

  // Website Publishing
  {
    patterns: [
      /\bpublish\s+(to|on)\s+(my\s+)?(website|blog|site|wordpress|wix)/i,
      /\bpush\s+to\s+(wordpress|wix|my\s+site)/i,
      /\bpost\s+(this|it)\s+(on|to)\s+my\s+(website|blog|site)/i,
      /\bpublish\s+(this|the)\s+(article|blog|post|content)\s+(to|on)/i,
      /\bput\s+(this|it)\s+on\s+my\s+(website|blog|site)/i,
    ],
    toolName: 'publish_to_website',
    confidence: 'high',
  },

  // Direct Social Post Creation
  {
    patterns: [
      /\b(create|write|make)\s+(a\s+)?social\s+(media\s+)?post/i,
      /\bschedule\s+(a\s+)?(tweet|post)\b/i,
      /\bpost\s+on\s+(linkedin|twitter|facebook|instagram|x)\b/i,
      /\b(tweet|post)\s+(this|about|on)\b/i,
      /\bwrite\s+(a\s+)?social\s+update/i,
    ],
    toolName: 'create_social_post',
    confidence: 'high',
  },

  // Schedule repurposed social posts
  {
    patterns: [
      /\bschedule\s+(these|the)\s+social\s+posts?/i,
      /\bpost\s+(these|them)\s+to\s+social/i,
      /\bsave\s+(and\s+)?(schedule\s+)?(the\s+)?social\s+posts?/i,
      /\bschedule\s+(them|these)\s+(for|on|at)\b/i,
    ],
    toolName: 'schedule_social_from_repurpose',
    confidence: 'high',
  },

  // Content gap analysis
  {
    patterns: [
      /\b(find|identify|show)\s+(content\s+)?gaps/i,
      /\bcontent\s+gap\s+(analysis|report)/i,
      /\bwhat\s+(am\s+I|are\s+we)\s+missing/i,
      /\bgap\s+analysis/i,
    ],
    toolName: 'trigger_content_gap_analysis',
    confidence: 'high',
  },

  // Content builder
  {
    patterns: [
      /\b(open|start|launch)\s+(the\s+)?content\s+builder/i,
      /\bguided\s+content\s+(creation|builder)/i,
    ],
    toolName: 'start_content_builder',
    confidence: 'high',
  },

  // Content wizard (chat sidebar)
  {
    patterns: [
      /\b(i\s+want\s+to\s+)?(create|write|build|make)\s+(a\s+)?(new\s+)?(blog|article|guide|content)\s+(about|on|for)\b/i,
      /\b(help\s+me\s+)?(create|write|build)\s+(a\s+)?(blog|article|guide)\b/i,
      /\bcreate\s+(a\s+)?blog\b/i,
      /\bwrite\s+(an?\s+)?article\b/i,
    ],
    toolName: 'launch_content_wizard',
    confidence: 'high',
    extractParams: (msg) => {
      // Try "about/on/for [topic]"
      const topicMatch = msg.match(/(?:about|on|for)\s+["']?(.+?)["']?\s*$/i);
      if (topicMatch) return { keyword: topicMatch[1].trim() };
      // Try extracting topic after content type word
      const fallback = msg.match(/(?:blog|article|guide|content)\s+(?:about|on|for|titled|called)?\s*["']?(.+?)["']?\s*$/i);
      if (fallback) return { keyword: fallback[1].trim() };
      return {};
    }
  },

  // Company info
  {
    patterns: [
      /\b(update|change|set|edit)\s+(my\s+)?company\s+(info|name|details|information)/i,
    ],
    toolName: 'update_company_info',
    confidence: 'high',
  },

  // Competitor update
  {
    patterns: [
      /\b(update|edit|change)\s+(the\s+)?competitor/i,
    ],
    toolName: 'update_competitor',
    confidence: 'high',
  },

  // Delete tools
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?contact/i,
    ],
    toolName: 'delete_contact',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?segment/i,
    ],
    toolName: 'delete_segment',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?(email\s+)?campaign/i,
    ],
    toolName: 'delete_email_campaign',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?journey/i,
    ],
    toolName: 'delete_journey',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?automation/i,
    ],
    toolName: 'delete_automation',
    confidence: 'high',
  },
  {
    patterns: [
      /\b(delete|remove)\s+(the\s+)?social\s+post/i,
    ],
    toolName: 'delete_social_post',
    confidence: 'high',
  },
];

/**
 * Detects write-action intent from a user message.
 * Returns the detected tool name and extracted parameters.
 */
export function detectActionIntent(message: string): ActionIntent {
  const trimmed = message.trim();
  
  // Skip very short messages or questions
  if (trimmed.length < 4) {
    return { detected: false, toolName: '', confidence: 'low', params: {} };
  }
  
  // Skip messages that are purely questions (start with question words and end with ?)
  if (/^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does)\b/i.test(trimmed) && trimmed.endsWith('?')) {
    return { detected: false, toolName: '', confidence: 'low', params: {} };
  }

  for (const rule of ACTION_RULES) {
    for (const pattern of rule.patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const params = rule.extractParams ? rule.extractParams(trimmed, match) : {};
        const requiresConfirmation = DESTRUCTIVE_TOOLS.has(rule.toolName);
        return {
          detected: true,
          toolName: rule.toolName,
          confidence: rule.confidence,
          params,
          requiresConfirmation,
        };
      }
    }
  }

  return { detected: false, toolName: '', confidence: 'low', params: {} };
}
