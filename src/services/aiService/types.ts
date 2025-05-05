
// Common types for AI service

export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'other';

export type AiModelType = 'chat' | 'completion' | 'embedding' | 'image';

export interface AiModelInfo {
  id: string;
  provider: AiProvider;
  name: string;
  description: string;
  maxTokens: number;
  type: AiModelType;
  capabilities: string[];
  isDefault?: boolean;
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiChatParams {
  model: string;
  messages: AiChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompletionParams {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiEmbeddingParams {
  model: string;
  input: string | string[];
}

// Type for API requests to the Edge Function
export interface AiApiParams {
  provider: AiProvider;
  endpoint: string;
  params: AiChatParams | AiCompletionParams | AiEmbeddingParams;
  apiKey?: string;
}

// Response types
export interface AiChatResponse {
  id: string;
  choices: {
    message: AiChatMessage;
    index: number;
    finishReason: string | null;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AiCompletionResponse {
  id: string;
  choices: {
    text: string;
    index: number;
    finishReason: string | null;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AiEmbeddingResponse {
  id: string;
  data: {
    embedding: number[];
    index: number;
  }[];
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}
