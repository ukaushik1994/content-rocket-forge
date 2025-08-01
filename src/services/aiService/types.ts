
export type AiProvider = 'openai' | 'anthropic' | 'gemini';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
