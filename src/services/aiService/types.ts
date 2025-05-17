
export type AiProvider = 
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'mistral'
  | 'lmstudio'
  | 'other'
  | 'gpt-4o'  
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ChatCompletionChoice {
  message: ChatMessage;
  finish_reason: string;
  index: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
}

// Adding missing type definitions
export interface AiModelInfo {
  id: string;
  provider: AiProvider;
  name: string;
  description: string;
  maxTokens: number;
  type: 'chat' | 'completion';
  capabilities: string[];
  isDefault?: boolean;
}

export interface AiApiParams {
  provider: string;
  endpoint?: string;
  service?: string;
  params?: any;
  apiKey?: string;
}

export interface AiChatParams {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  choices?: ChatCompletionChoice[]; // Add the choices property that several files are using
}

export interface AiCompletionParams {
  prompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  choices?: ChatCompletionChoice[]; // Add the choices property here as well
}
