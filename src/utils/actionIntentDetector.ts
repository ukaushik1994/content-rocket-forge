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
  aiResponseOnly?: boolean;
  extractParams?: (message: string, match: RegExpMatchArray) => Record<string, any> | null;
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
  // Content wizard (chat sidebar) — MUST be before create_content_item
  {
    patterns: [
      /\b(i\s+want\s+to\s+)?(create|write|build|make)\s+(a\s+)?(new\s+)?(blog|article|guide|content)\s+(about|on|for)\b/i,
      /\b(help\s+me\s+)?(create|write|build)\s+(a\s+)?(blog|article|guide)\b/i,
      /\bcreate\s+(a\s+)?blog\b/i,
      /\bwrite\s+(an?\s+)?article\b/i,
      /\b(create|write|generate)\s+(a\s+)?(new\s+)?(blog\s*post|article|content|draft)/i,
    ],
    toolName: 'launch_content_wizard',
    confidence: 'high',
    extractParams: (msg) => {
      const topicMatch = msg.match(/(?:about|on|for)\s+["']?(.+?)["']?\s*$/i);
      if (topicMatch) return { keyword: topicMatch[1].trim() };
      const fallback = msg.match(/(?:blog|article|guide|content)\s+(?:about|on|for|titled|called)?\s*["']?(.+?)["']?\s*$/i);
      if (fallback) return { keyword: fallback[1].trim() };
      return null;
    }
  },

  // AI-response patterns: detect when the AI says it's launching the content wizard
  {
    patterns: [
      /launching\s+(the\s+)?content\s+(creation\s+)?wizard/i,
      /starting\s+(the\s+)?content\s+(creation\s+)?wizard/i,
      /let\s+me\s+(start|launch|open)\s+(the\s+)?content\s+(creation\s+)?wizard/i,
      /I'll\s+(launch|start|open)\s+(the\s+)?content\s+(creation\s+)?wizard/i,
      /opening\s+(the\s+)?content\s+(creation\s+)?wizard/i,
      /content\s+wizard\s+(is\s+)?(now\s+)?(ready|open|launch)/i,
    ],
    toolName: 'launch_content_wizard',
    confidence: 'high',
    aiResponseOnly: true,
    extractParams: (msg) => {
      const topicMatch = msg.match(/(?:about|for|on|topic[:\s]+)\s*["']?([^"'\n,.!?]{3,60})["']?/i);
      if (topicMatch) return { keyword: topicMatch[1].trim() };
      const quoted = msg.match(/["']([^"']{3,60})["']/);
      if (quoted) return { keyword: quoted[1].trim() };
      return null;
    }
  },

  // Content save/store (NOT creation — wizard handles creation)
  {
    patterns: [
      /\b(save|store)\s+(this|that|it)\s*(as\s+)?(a\s+)?(draft|blog|post|article|content)/i,
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
    // Skip AI-response-only patterns when checking user messages
    if (rule.aiResponseOnly) continue;
    for (const pattern of rule.patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const params = rule.extractParams ? rule.extractParams(trimmed, match) : {};
        // If extractParams returns null, the intent needs more info — skip it
        if (params === null) continue;
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

/**
 * Detects intent from AI response text only.
 * Only checks rules flagged with aiResponseOnly: true.
 */
export function detectAIResponseIntent(aiResponse: string): ActionIntent {
  const trimmed = aiResponse.trim();
  if (trimmed.length < 10) {
    return { detected: false, toolName: '', confidence: 'low', params: {} };
  }

  for (const rule of ACTION_RULES) {
    if (!rule.aiResponseOnly) continue;
    for (const pattern of rule.patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const params = rule.extractParams ? rule.extractParams(trimmed, match) : {};
        if (params === null) continue;
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
