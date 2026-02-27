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
      return {};
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
      // Broader AI response patterns
      /I'll\s+(help\s+you\s+)?(create|write)\s+(a\s+)?(blog|article|content)\s+(about|on)/i,
      /let's\s+(create|write|build)\s+(a\s+)?(blog|article|content)/i,
      /let\s+me\s+(help\s+you\s+)?(create|write|draft)\s+(a\s+)?(blog|article|content|post)/i,
      /I'll\s+(get|set)\s+(the\s+)?content\s+(wizard|creation)/i,
      /starting\s+(the\s+)?content\s+creation/i,
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

/**
 * Contextual follow-up detection.
 * Checks if the previous AI message was asking for a topic/keyword,
 * and the current user message is a short non-question (likely the topic).
 */
const TOPIC_ASK_PATTERNS = [
  /what\s+(topic|keyword|subject)/i,
  /write\s+about/i,
  /which\s+(topic|keyword)/i,
  /what\s+would\s+you\s+like\s+to\s+(write|create|blog)/i,
  /what\s+should\s+(I|we)\s+write/i,
  /provide\s+(a\s+)?(topic|keyword)/i,
  /enter\s+(a\s+)?(topic|keyword)/i,
  /what\s+(is|are)\s+(the\s+)?(topic|keyword)/i,
];

export function detectContextualContentIntent(
  userMessage: string,
  recentMessages: Array<{ role: string; content: string }>
): ActionIntent {
  const trimmed = userMessage.trim();
  
  // Must be short (topic-like) and not a question
  if (trimmed.length > 80 || trimmed.length < 2 || trimmed.endsWith('?')) {
    return { detected: false, toolName: '', confidence: 'low', params: {} };
  }

  // Look at last 3 assistant messages for topic-asking patterns
  const recentAssistant = recentMessages
    .filter(m => m.role === 'assistant')
    .slice(-3);

  for (const msg of recentAssistant) {
    for (const pattern of TOPIC_ASK_PATTERNS) {
      if (pattern.test(msg.content)) {
        return {
          detected: true,
          toolName: 'launch_content_wizard',
          confidence: 'medium',
          params: { keyword: trimmed },
        };
      }
    }
  }

  return { detected: false, toolName: '', confidence: 'low', params: {} };
}
