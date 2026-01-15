import { ImageSlot } from '@/components/content/ImagePlaceholder';
import { AttachedImage } from '@/components/content/AttachedImagesGallery';
import { detectImageLocations, shouldAutoGenerateImages, suggestImageCount } from '@/utils/imageLocationDetector';
import ImageGenService, { GeneratedImage } from './imageGenService';
import { v4 as uuidv4 } from 'uuid';

interface OrchestrationOptions {
  autoDetect?: boolean;
  maxImages?: number;
  onSlotUpdate?: (slot: ImageSlot) => void;
  onComplete?: (images: AttachedImage[]) => void;
  onError?: (error: Error) => void;
}

interface OrchestrationResult {
  success: boolean;
  images: AttachedImage[];
  slots: ImageSlot[];
  errors: string[];
}

/**
 * Orchestrates the image generation process
 * Coordinates between text content and image generation
 */
export class ImageGenOrchestrator {
  private imageService: typeof ImageGenService;
  
  constructor() {
    this.imageService = ImageGenService;
  }

  /**
   * Check if image generation is available (provider configured)
   */
  async isAvailable(): Promise<boolean> {
    const provider = await this.imageService.getActiveImageProvider();
    return provider !== null && provider.isConfigured;
  }

  /**
   * Get the preferred image provider name
   */
  async getProviderName(): Promise<string | null> {
    const provider = await this.imageService.getActiveImageProvider();
    return provider?.name || null;
  }

  /**
   * Analyze content and determine optimal image placements
   */
  analyzeContent(content: string): {
    shouldGenerate: boolean;
    suggestedCount: number;
    slots: ImageSlot[];
  } {
    const shouldGenerate = shouldAutoGenerateImages(content);
    const suggestedCount = suggestImageCount(content);
    const slots = shouldGenerate 
      ? detectImageLocations(content, { maxImages: suggestedCount })
      : [];

    return {
      shouldGenerate,
      suggestedCount,
      slots
    };
  }

  /**
   * Generate images for all provided slots
   */
  async generateForSlots(
    slots: ImageSlot[],
    options: OrchestrationOptions = {}
  ): Promise<OrchestrationResult> {
    const { onSlotUpdate, onComplete, onError } = options;
    const results: AttachedImage[] = [];
    const errors: string[] = [];
    const updatedSlots = [...slots];

    // Check if image generation is available
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      const error = 'No image generation provider configured';
      errors.push(error);
      onError?.(new Error(error));
      return {
        success: false,
        images: [],
        slots: slots.map(s => ({ ...s, status: 'failed' as const, error })),
        errors
      };
    }

    // Generate images sequentially to avoid rate limiting
    for (let i = 0; i < updatedSlots.length; i++) {
      const slot = updatedSlots[i];
      
      // Update status to generating
      updatedSlots[i] = { ...slot, status: 'generating' };
      onSlotUpdate?.(updatedSlots[i]);

      try {
        const result = await this.imageService.generateImage({
          prompt: slot.prompt,
          style: 'vivid',
          size: '1536x1024' // 16:9-ish aspect ratio
        });

        if (result && (result.url || result.base64)) {
          // Success
          const imageUrl = result.url || `data:image/png;base64,${result.base64}`;
          updatedSlots[i] = {
            ...slot,
            status: 'completed',
            imageUrl
          };
          
          results.push({
            id: slot.id,
            url: imageUrl,
            prompt: slot.prompt,
            provider: result.provider,
            createdAt: result.createdAt
          });
        } else {
          // Failed
          const errorMsg = 'Image generation returned no result';
          updatedSlots[i] = {
            ...slot,
            status: 'failed',
            error: errorMsg
          };
          errors.push(`Slot ${i + 1}: ${errorMsg}`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Generation failed';
        updatedSlots[i] = {
          ...slot,
          status: 'failed',
          error: errorMsg
        };
        errors.push(`Slot ${i + 1}: ${errorMsg}`);
      }

      onSlotUpdate?.(updatedSlots[i]);
    }

    const success = errors.length === 0;
    onComplete?.(results);

    return {
      success,
      images: results,
      slots: updatedSlots,
      errors
    };
  }

  /**
   * Generate a single image with a custom prompt
   */
  async generateSingleImage(prompt: string): Promise<AttachedImage | null> {
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      return null;
    }

    try {
      const result = await this.imageService.generateImage({
        prompt,
        style: 'vivid',
        size: '1536x1024'
      });

      if (result && (result.url || result.base64)) {
        const imageUrl = result.url || `data:image/png;base64,${result.base64}`;
        return {
          id: uuidv4(),
          url: imageUrl,
          prompt,
          provider: result.provider,
          createdAt: result.createdAt
        };
      }
    } catch (err) {
      console.error('Single image generation failed:', err);
    }

    return null;
  }

  /**
   * Full orchestration: analyze content, detect slots, generate images
   */
  async orchestrateForContent(
    content: string,
    options: OrchestrationOptions = {}
  ): Promise<OrchestrationResult> {
    const analysis = this.analyzeContent(content);
    
    if (!analysis.shouldGenerate || analysis.slots.length === 0) {
      return {
        success: true,
        images: [],
        slots: [],
        errors: []
      };
    }

    // Apply max images limit if provided
    const slotsToGenerate = options.maxImages 
      ? analysis.slots.slice(0, options.maxImages)
      : analysis.slots;

    return await this.generateForSlots(slotsToGenerate, options);
  }

  /**
   * Creates placeholder slots without generating images
   * Useful for "placeholder first" approach
   */
  createPlaceholders(content: string, maxImages?: number): ImageSlot[] {
    const analysis = this.analyzeContent(content);
    const slots = maxImages 
      ? analysis.slots.slice(0, maxImages)
      : analysis.slots;
    
    return slots.map(slot => ({
      ...slot,
      status: 'pending' as const
    }));
  }

  /**
   * Attach generated images to a content item in the database
   */
  async attachImagesToContent(contentId: string, images: AttachedImage[]): Promise<boolean> {
    try {
      for (const image of images) {
        const generatedImage: GeneratedImage = {
          id: image.id,
          url: image.url,
          prompt: image.prompt,
          provider: image.provider || 'unknown',
          model: 'unknown',
          createdAt: image.createdAt || new Date().toISOString()
        };
        await this.imageService.attachImageToContent(contentId, generatedImage);
      }
      return true;
    } catch (err) {
      console.error('Failed to attach images to content:', err);
      return false;
    }
  }
}

// Singleton instance for easy access
export const imageGenOrchestrator = new ImageGenOrchestrator();
