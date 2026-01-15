import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  size?: '1024x1024' | '1024x1536' | '1536x1024' | '512x512';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  model?: string;
  provider?: 'openai_image' | 'gemini_image' | 'lmstudio_image';
}

export interface GeneratedImage {
  id: string;
  url?: string;
  base64?: string;
  prompt: string;
  provider: string;
  model: string;
  createdAt: string;
}

export interface ImageGenProviderInfo {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  isConfigured: boolean;
  models: string[];
}

class ImageGenService {
  private static instance: ImageGenService;

  static getInstance(): ImageGenService {
    if (!ImageGenService.instance) {
      ImageGenService.instance = new ImageGenService();
    }
    return ImageGenService.instance;
  }

  /**
   * Get active image generation provider
   */
  async getActiveImageProvider(): Promise<ImageGenProviderInfo | null> {
    try {
      const providers = await AIServiceController.getAllProviders();
      
      // Find active image/video generation provider
      const imageProviders = providers.filter(p => p.category === 'Image/Video Gen');
      const activeProvider = imageProviders.find(p => p.status === 'active' && p.is_configured);
      
      if (!activeProvider) {
        return null;
      }

      return {
        id: activeProvider.id,
        name: activeProvider.name,
        status: activeProvider.status as 'active' | 'inactive' | 'error',
        isConfigured: activeProvider.is_configured || false,
        models: activeProvider.available_models
      };
    } catch (error) {
      console.error('Error getting active image provider:', error);
      return null;
    }
  }

  /**
   * Get all configured image generation providers
   */
  async getAllImageProviders(): Promise<ImageGenProviderInfo[]> {
    try {
      const providers = await AIServiceController.getAllProviders();
      
      return providers
        .filter(p => p.category === 'Image/Video Gen')
        .map(p => ({
          id: p.id,
          name: p.name,
          status: p.status as 'active' | 'inactive' | 'error',
          isConfigured: p.is_configured || false,
          models: p.available_models
        }));
    } catch (error) {
      console.error('Error getting image providers:', error);
      return [];
    }
  }

  /**
   * Generate an image using the active or specified provider
   */
  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to generate images');
        return null;
      }

      // Determine provider to use
      let providerToUse = request.provider;
      
      if (!providerToUse) {
        const activeProvider = await this.getActiveImageProvider();
        if (!activeProvider) {
          toast.error('No image generation provider configured. Please set up a provider in Settings.');
          return null;
        }
        providerToUse = activeProvider.id as 'openai_image' | 'gemini_image' | 'lmstudio_image';
      }

      console.log(`🎨 Generating image with ${providerToUse}...`);
      toast.loading('Generating image...');

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          provider: providerToUse,
          prompt: request.prompt,
          negativePrompt: request.negativePrompt,
          size: request.size || '1024x1024',
          quality: request.quality || 'standard',
          style: request.style || 'vivid',
          model: request.model
        }
      });

      if (error) {
        console.error('Image generation error:', error);
        toast.error(`Image generation failed: ${error.message}`);
        return null;
      }

      if (!data?.success) {
        console.error('Image generation failed:', data?.error);
        toast.error(data?.error || 'Image generation failed');
        return null;
      }

      toast.success('Image generated successfully!');

      return {
        id: crypto.randomUUID(),
        url: data.imageUrl,
        base64: data.imageBase64,
        prompt: request.prompt,
        provider: data.provider_used || providerToUse,
        model: data.model_used || request.model || 'default',
        createdAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image');
      return null;
    }
  }

  /**
   * Attach generated image to a content item
   */
  async attachImageToContent(
    contentId: string, 
    image: GeneratedImage
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return false;
      }

      // Get current content item - use type assertion since column may not be in types yet
      const { data: content, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch content:', fetchError);
        toast.error('Failed to attach image');
        return false;
      }

      // Append new image to existing images (using type assertion for new column)
      const existingImages = ((content as any)?.generated_images as GeneratedImage[]) || [];
      const updatedImages = [...existingImages, image];

      // Update content item
      const { error: updateError } = await supabase
        .from('content_items')
        .update({ 
          generated_images: updatedImages as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update content:', updateError);
        toast.error('Failed to attach image');
        return false;
      }

      toast.success('Image attached to content');
      return true;
    } catch (error: any) {
      console.error('Error attaching image:', error);
      toast.error(error.message || 'Failed to attach image');
      return false;
    }
  }

  /**
   * Remove an image from a content item
   */
  async removeImageFromContent(
    contentId: string,
    imageId: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return false;
      }

      // Get current content item - use type assertion since column may not be in types yet
      const { data: content, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch content:', fetchError);
        toast.error('Failed to remove image');
        return false;
      }

      // Filter out the image (using type assertion for new column)
      const existingImages = ((content as any)?.generated_images as GeneratedImage[]) || [];
      const updatedImages = existingImages.filter(img => img.id !== imageId);

      // Update content item
      const { error: updateError } = await supabase
        .from('content_items')
        .update({ 
          generated_images: updatedImages as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update content:', updateError);
        toast.error('Failed to remove image');
        return false;
      }

      toast.success('Image removed');
      return true;
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast.error(error.message || 'Failed to remove image');
      return false;
    }
  }
}

export default ImageGenService.getInstance();
