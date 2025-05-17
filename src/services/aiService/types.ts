
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
