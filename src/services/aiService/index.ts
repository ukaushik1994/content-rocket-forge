
import { AiProvider, ChatRequest, ChatResponse } from './types';

export async function sendChatRequest(
  provider: AiProvider,
  request: ChatRequest
): Promise<ChatResponse | null> {
  try {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return {
      choices: [{
        message: {
          content: 'This is a mock AI response. In a real implementation, this would connect to your chosen AI provider.'
        }
      }]
    };
  } catch (error) {
    console.error('Error sending chat request:', error);
    return null;
  }
}

export * from './types';
