import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LMStudioConfig {
  serverUrl: string;
  model?: string;
}

interface LMStudioModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

class LMStudioService {
  private static DEFAULT_URL = 'http://localhost:1234';

  /**
   * Get the configured LM Studio server URL
   */
  static async getServerUrl(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.DEFAULT_URL;

      const { data } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('service', 'lmstudio')
        .eq('is_active', true)
        .single();

      return data?.encrypted_key || this.DEFAULT_URL;
    } catch (error) {
      console.error('Error getting LM Studio URL:', error);
      return this.DEFAULT_URL;
    }
  }

  /**
   * Save LM Studio server URL
   */
  static async saveServerUrl(url: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return false;
      }

      // Clean up URL
      const cleanUrl = url.trim().replace(/\/$/, '');

      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: user.id,
          service: 'lmstudio',
          encrypted_key: cleanUrl,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,service'
        });

      if (error) {
        console.error('Error saving LM Studio URL:', error);
        toast.error('Failed to save server URL');
        return false;
      }

      toast.success('LM Studio server URL saved');
      return true;
    } catch (error) {
      console.error('Error in saveServerUrl:', error);
      toast.error('Failed to save server URL');
      return false;
    }
  }

  /**
   * Test connection to LM Studio
   */
  static async testConnection(url?: string): Promise<boolean> {
    try {
      const serverUrl = url || await this.getServerUrl();
      console.log('🔌 Testing LM Studio connection at:', serverUrl);

      const response = await fetch(`${serverUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LM Studio connection failed:', response.status, errorText);
        toast.error(`Connection failed: ${response.status} ${response.statusText}`);
        return false;
      }

      const data = await response.json();
      console.log('✅ LM Studio connected, models:', data);
      return true;
    } catch (error: any) {
      console.error('LM Studio connection error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Cannot connect to LM Studio. Make sure:\n1. LM Studio is running\n2. Local server is started\n3. CORS is enabled in Settings');
      } else {
        toast.error(`Connection error: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Get available models from LM Studio
   */
  static async getAvailableModels(url?: string): Promise<LMStudioModel[]> {
    try {
      const serverUrl = url || await this.getServerUrl();
      console.log('📋 Fetching LM Studio models from:', serverUrl);

      const response = await fetch(`${serverUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching LM Studio models:', error);
      return [];
    }
  }

  /**
   * Send chat request directly to LM Studio (browser -> local server)
   */
  static async sendChatRequest(
    messages: Array<{ role: string; content: string }>,
    model?: string,
    onStreamUpdate?: (chunk: string) => void
  ): Promise<string> {
    try {
      const serverUrl = await this.getServerUrl();
      console.log('💬 Sending chat request to LM Studio:', serverUrl);

      // Get available models if no model specified
      let selectedModel = model;
      if (!selectedModel) {
        const models = await this.getAvailableModels(serverUrl);
        if (models.length === 0) {
          throw new Error('No models loaded in LM Studio. Please load a model first.');
        }
        selectedModel = models[0].id;
        console.log('Using first available model:', selectedModel);
      }

      const response = await fetch(`${serverUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false // For now, keep it simple without streaming
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LM Studio chat request failed:', response.status, errorText);
        throw new Error(`Chat request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from LM Studio');
      }

      console.log('✅ LM Studio response received');
      return content;
    } catch (error: any) {
      console.error('LM Studio chat error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to LM Studio. Make sure it\'s running and the server is started.');
      }
      throw error;
    }
  }

  /**
   * Check if LM Studio is configured and running
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('api_keys')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('service', 'lmstudio')
        .single();

      if (!data?.is_active) return false;

      // Try a quick connection test
      return await this.testConnection();
    } catch (error) {
      console.error('LM Studio availability check failed:', error);
      return false;
    }
  }
}

export default LMStudioService;
