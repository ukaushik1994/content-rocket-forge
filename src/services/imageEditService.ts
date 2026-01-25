import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import type { GeneratedImage } from '@/services/imageGenService';

export type ImageEditMode = 'variation' | 'inpaint' | 'expand' | 'upscale';

export interface ImageEditRequest {
  sourceImage: GeneratedImage | { url: string; base64?: string };
  mode: ImageEditMode;
  prompt?: string;
  maskImageUrl?: string;       // For inpaint - areas to modify
  expandDirection?: 'up' | 'down' | 'left' | 'right' | 'all';
  size?: string;
  provider?: 'openai_image' | 'gemini_image';
}

export interface EditedImage extends GeneratedImage {
  sourceImageId?: string;
  editMode: ImageEditMode;
}

class ImageEditService {
  private static instance: ImageEditService;

  static getInstance(): ImageEditService {
    if (!ImageEditService.instance) {
      ImageEditService.instance = new ImageEditService();
    }
    return ImageEditService.instance;
  }

  /**
   * Get active image provider that supports editing
   */
  async getActiveEditProvider(): Promise<{ id: string; name: string } | null> {
    try {
      const providers = await AIServiceController.getAllProviders();
      
      // Find active image provider (OpenAI or Gemini - they support editing)
      const imageProviders = providers.filter(p => 
        p.category === 'Image/Video Gen' && 
        (p.id === 'openai_image' || p.id === 'gemini_image')
      );
      const activeProvider = imageProviders.find(p => p.status === 'active' && p.is_configured);
      
      if (!activeProvider) {
        return null;
      }

      return {
        id: activeProvider.id,
        name: activeProvider.name
      };
    } catch (error) {
      console.error('Error getting active edit provider:', error);
      return null;
    }
  }

  /**
   * Create a variation of an existing image
   */
  async createVariation(
    sourceImage: GeneratedImage | { url: string },
    prompt?: string
  ): Promise<EditedImage | null> {
    return this.editImage({
      sourceImage,
      mode: 'variation',
      prompt
    });
  }

  /**
   * Inpaint/edit specific areas of an image
   */
  async inpaint(
    sourceImage: GeneratedImage | { url: string },
    prompt: string,
    maskImageUrl?: string
  ): Promise<EditedImage | null> {
    return this.editImage({
      sourceImage,
      mode: 'inpaint',
      prompt,
      maskImageUrl
    });
  }

  /**
   * Expand/outpaint an image in a direction
   */
  async expand(
    sourceImage: GeneratedImage | { url: string },
    direction: 'up' | 'down' | 'left' | 'right' | 'all',
    prompt?: string
  ): Promise<EditedImage | null> {
    return this.editImage({
      sourceImage,
      mode: 'expand',
      expandDirection: direction,
      prompt
    });
  }

  /**
   * Upscale an image to higher resolution
   */
  async upscale(
    sourceImage: GeneratedImage | { url: string },
    prompt?: string
  ): Promise<EditedImage | null> {
    return this.editImage({
      sourceImage,
      mode: 'upscale',
      prompt,
      size: '1536x1024' // Larger output size
    });
  }

  /**
   * Core edit function
   */
  async editImage(request: ImageEditRequest): Promise<EditedImage | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to edit images');
        return null;
      }

      // Determine provider to use
      let providerToUse = request.provider;
      
      if (!providerToUse) {
        const activeProvider = await this.getActiveEditProvider();
        if (!activeProvider) {
          toast.error('No image editing provider configured. Please set up OpenAI or Gemini in Settings.');
          return null;
        }
        providerToUse = activeProvider.id as 'openai_image' | 'gemini_image';
      }

      const modeLabels: Record<ImageEditMode, string> = {
        variation: 'Creating variation',
        inpaint: 'Editing image',
        expand: 'Expanding image',
        upscale: 'Upscaling image'
      };

      console.log(`🖌️ ${modeLabels[request.mode]} with ${providerToUse}...`);
      const toastId = toast.loading(`${modeLabels[request.mode]}...`);

      // Get source image URL
      const sourceImageUrl = 'url' in request.sourceImage 
        ? request.sourceImage.url 
        : request.sourceImage.base64;

      if (!sourceImageUrl) {
        toast.error('No source image URL provided', { id: toastId });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          provider: providerToUse,
          mode: request.mode,
          sourceImageUrl,
          prompt: request.prompt,
          maskImageUrl: request.maskImageUrl,
          expandDirection: request.expandDirection,
          size: request.size
        }
      });

      if (error) {
        console.error('Image edit error:', error);
        toast.error(`Image editing failed: ${error.message}`, { id: toastId });
        return null;
      }

      if (!data?.success) {
        console.error('Image edit failed:', data?.error);
        toast.error(data?.error || 'Image editing failed', { id: toastId });
        return null;
      }

      toast.success('Image edited successfully!', { id: toastId });

      const editedImage: EditedImage = {
        id: crypto.randomUUID(),
        url: data.imageUrl,
        base64: data.imageBase64,
        prompt: request.prompt || `${request.mode} of original`,
        provider: data.provider_used || providerToUse,
        model: data.model_used || 'default',
        createdAt: new Date().toISOString(),
        sourceImageId: 'id' in request.sourceImage ? request.sourceImage.id : undefined,
        editMode: request.mode
      };

      return editedImage;
    } catch (error: any) {
      console.error('Error editing image:', error);
      toast.error(error.message || 'Failed to edit image');
      return null;
    }
  }

  /**
   * Replace an image in content with an edited version
   */
  async replaceImageInContent(
    contentId: string,
    originalImageId: string,
    newImage: EditedImage
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return false;
      }

      const { data: content, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch content:', fetchError);
        toast.error('Failed to update image');
        return false;
      }

      const existingImages = ((content as any)?.generated_images as GeneratedImage[]) || [];
      
      // Replace the original image with the new one
      const updatedImages = existingImages.map(img => 
        img.id === originalImageId ? { ...newImage, id: originalImageId } : img
      );

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
        toast.error('Failed to update image');
        return false;
      }

      toast.success('Image replaced successfully');
      return true;
    } catch (error: any) {
      console.error('Error replacing image:', error);
      toast.error(error.message || 'Failed to replace image');
      return false;
    }
  }
}

export default ImageEditService.getInstance();
