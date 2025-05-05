
import { AiModelInfo } from './types';

// OpenAI models
export const OPENAI_MODELS: AiModelInfo[] = [
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'GPT-4o Mini',
    description: 'Fastest and most cost-effective version of GPT-4o with vision capabilities',
    maxTokens: 128000,
    type: 'chat',
    capabilities: ['text', 'vision', 'function-calling'],
    isDefault: true
  },
  {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'Most powerful model with vision capabilities and enhanced reasoning',
    maxTokens: 128000,
    type: 'chat',
    capabilities: ['text', 'vision', 'function-calling']
  },
  {
    id: 'gpt-4.5-preview',
    provider: 'openai',
    name: 'GPT-4.5 Preview',
    description: 'Preview of the very powerful GPT-4.5 model',
    maxTokens: 128000,
    type: 'chat',
    capabilities: ['text', 'function-calling']
  }
];

// Anthropic models
export const ANTHROPIC_MODELS: AiModelInfo[] = [
  {
    id: 'claude-3-opus-20240229',
    provider: 'anthropic',
    name: 'Claude 3 Opus',
    description: 'Most powerful Claude model with exceptional understanding and reasoning',
    maxTokens: 200000,
    type: 'chat',
    capabilities: ['text', 'vision']
  },
  {
    id: 'claude-3-sonnet-20240229',
    provider: 'anthropic',
    name: 'Claude 3 Sonnet',
    description: 'Balanced Claude model for most tasks at a lower cost',
    maxTokens: 200000,
    type: 'chat',
    capabilities: ['text', 'vision'],
    isDefault: true
  },
  {
    id: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model with lower cost for simpler tasks',
    maxTokens: 200000,
    type: 'chat',
    capabilities: ['text', 'vision']
  }
];

// Google Gemini models
export const GEMINI_MODELS: AiModelInfo[] = [
  {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    name: 'Gemini 1.5 Pro',
    description: 'Gemini\'s most capable model for a wide range of tasks',
    maxTokens: 1000000,
    type: 'chat',
    capabilities: ['text', 'vision', 'audio'],
    isDefault: true
  },
  {
    id: 'gemini-1.5-flash',
    provider: 'gemini',
    name: 'Gemini 1.5 Flash',
    description: 'Faster and more cost-effective version of Gemini',
    maxTokens: 1000000,
    type: 'chat',
    capabilities: ['text', 'vision', 'audio']
  }
];

// Combined list of all models
export const ALL_AI_MODELS: AiModelInfo[] = [
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...GEMINI_MODELS
];

// Helper function to get default model for a provider
export function getDefaultModel(provider: string): AiModelInfo | undefined {
  const models = ALL_AI_MODELS.filter(model => model.provider === provider);
  return models.find(model => model.isDefault) || models[0];
}

// Helper function to get model by ID
export function getModelById(modelId: string): AiModelInfo | undefined {
  return ALL_AI_MODELS.find(model => model.id === modelId);
}
