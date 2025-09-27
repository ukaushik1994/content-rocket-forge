import { useState, useEffect, useMemo } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';

export interface ChatSuggestion {
  id: string;
  type: 'follow_up' | 'deep_dive' | 'related' | 'action';
  text: string;
  description?: string;
  confidence: number;
  category: 'question' | 'clarification' | 'expansion' | 'implementation';
}

export const useSmartSuggestions = (messages: EnhancedChatMessage[]) => {
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate smart suggestions based on the last AI response
  const generateSuggestions = useMemo(() => {
    if (messages.length === 0) return [];

    const lastMessage = messages[messages.length - 1];
    const lastAIMessage = messages.filter(m => m.role === 'assistant').pop();
    
    if (!lastAIMessage || lastMessage.role !== 'assistant') return [];

    const content = lastAIMessage.content.toLowerCase();
    const suggestions: ChatSuggestion[] = [];

    // Analyze content for suggestion opportunities
    const keywords = extractKeywords(content);
    const topics = extractTopics(content);
    const hasCode = content.includes('```') || content.includes('function') || content.includes('component');
    const hasSteps = content.includes('step') || content.includes('1.') || content.includes('first');
    const hasExample = content.includes('example') || content.includes('for instance');

    // Generate follow-up questions
    if (keywords.length > 0) {
      const mainKeyword = keywords[0];
      suggestions.push({
        id: `follow-up-${Date.now()}-1`,
        type: 'follow_up',
        text: `Tell me more about ${mainKeyword}`,
        description: `Get deeper insights about ${mainKeyword}`,
        confidence: 0.8,
        category: 'expansion'
      });
    }

    // Generate clarification questions
    if (hasCode) {
      suggestions.push({
        id: `clarify-${Date.now()}-1`,
        type: 'deep_dive',
        text: "Can you explain how this code works?",
        description: "Get a detailed explanation of the implementation",
        confidence: 0.9,
        category: 'clarification'
      });

      suggestions.push({
        id: `implement-${Date.now()}-1`,
        type: 'action',
        text: "Show me how to implement this",
        description: "Get step-by-step implementation guidance",
        confidence: 0.85,
        category: 'implementation'
      });
    }

    // Generate expansion suggestions
    if (hasSteps) {
      suggestions.push({
        id: `expand-${Date.now()}-1`,
        type: 'related',
        text: "What are the next steps?",
        description: "Continue with the next phase of this process",
        confidence: 0.8,
        category: 'expansion'
      });
    }

    // Generate example requests
    if (!hasExample && topics.length > 0) {
      suggestions.push({
        id: `example-${Date.now()}-1`,
        type: 'follow_up',
        text: `Can you show me an example of ${topics[0]}?`,
        description: `See a practical example of ${topics[0]}`,
        confidence: 0.75,
        category: 'clarification'
      });
    }

    // Generate alternative approach suggestions
    suggestions.push({
      id: `alternative-${Date.now()}-1`,
      type: 'related',
      text: "Are there alternative approaches to this?",
      description: "Explore different ways to solve this problem",
      confidence: 0.7,
      category: 'expansion'
    });

    // Generate best practices suggestion
    if (hasCode || topics.some(t => ['component', 'function', 'api', 'database'].includes(t))) {
      suggestions.push({
        id: `best-practices-${Date.now()}-1`,
        type: 'deep_dive',
        text: "What are the best practices for this?",
        description: "Learn about industry best practices and common pitfalls",
        confidence: 0.8,
        category: 'expansion'
      });
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }, [messages]);

  useEffect(() => {
    setIsGenerating(true);
    const timer = setTimeout(() => {
      setSuggestions(generateSuggestions);
      setIsGenerating(false);
    }, 500); // Slight delay to simulate processing

    return () => clearTimeout(timer);
  }, [generateSuggestions]);

  return { suggestions, isGenerating };
};

// Helper functions for content analysis
function extractKeywords(content: string): string[] {
  const keywords = [];
  const words = content.split(/\s+/);
  
  // Look for capitalized words that might be technologies, concepts, etc.
  for (const word of words) {
    if (word.length > 3 && /^[A-Z][a-z]+/.test(word)) {
      keywords.push(word.toLowerCase());
    }
  }

  // Look for common technical terms
  const techTerms = ['react', 'javascript', 'typescript', 'component', 'function', 'api', 'database', 'supabase', 'authentication', 'webhook', 'integration'];
  for (const term of techTerms) {
    if (content.includes(term.toLowerCase())) {
      keywords.push(term);
    }
  }

  return [...new Set(keywords)].slice(0, 3);
}

function extractTopics(content: string): string[] {
  const topics = [];
  
  // Look for noun phrases and technical concepts
  const patterns = [
    /(?:create|build|implement|setup|configure)\s+(\w+(?:\s+\w+)?)/gi,
    /(?:use|using|with)\s+(\w+(?:\s+\w+)?)/gi,
    /(\w+)\s+(?:component|function|service|api|endpoint)/gi
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 2) {
        topics.push(match[1].toLowerCase().trim());
      }
    }
  }

  return [...new Set(topics)].slice(0, 3);
}