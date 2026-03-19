/**
 * Image Generation Tools for AI Chat
 * Provides generate_image and edit_image tools that call the existing generate-image edge function
 */

export const IMAGE_GENERATION_TOOL_NAMES = ['generate_image', 'edit_image'];

export const IMAGE_GENERATION_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "generate_image",
      description: "Generate an image from a text prompt using AI (OpenAI DALL-E, Gemini, or LMStudio). Use when the user asks to create, generate, draw, or make an image, picture, illustration, or visual.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Detailed text description of the image to generate"
          },
          size: {
            type: "string",
            enum: ["1024x1024", "1024x1792", "1792x1024", "512x512"],
            description: "Image dimensions (default: 1024x1024)"
          },
          quality: {
            type: "string",
            enum: ["standard", "hd"],
            description: "Image quality (default: standard)"
          },
          style: {
            type: "string",
            enum: ["vivid", "natural"],
            description: "Image style (default: vivid)"
          },
          provider: {
            type: "string",
            enum: ["openai_image", "gemini_image", "lmstudio_image"],
            description: "Which AI provider to use (default: openai_image)"
          }
        },
        required: ["prompt"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "edit_image",
      description: "Edit or modify an existing image using AI. Use when the user asks to edit, modify, change, or alter an existing image.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Description of the edits to apply to the image"
          },
          source_image_url: {
            type: "string",
            description: "URL of the source image to edit"
          },
          provider: {
            type: "string",
            enum: ["openai_image", "gemini_image", "lmstudio_image"],
            description: "Which AI provider to use (default: openai_image)"
          }
        },
        required: ["prompt", "source_image_url"]
      }
    }
  }
];

export async function executeImageGenerationTool(
  toolName: string,
  toolArgs: any,
  supabase: any,
  userId: string
): Promise<any> {
  console.log(`[IMAGE-TOOL] ${toolName} | user: ${userId} | prompt: ${toolArgs.prompt?.substring(0, 50)}...`);

  // Check if user has an active image provider configured
  const provider = toolArgs.provider || 'openai_image';
  const { data: providerData, error: providerError } = await supabase
    .from('ai_service_providers')
    .select('id, provider, status')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('status', 'active')
    .maybeSingle();

  // Fallback: check api_keys table if ai_service_providers has no entry
  let hasKey = !!providerData;
  if (!hasKey) {
    const serviceMap: Record<string, string> = {
      'openai_image': 'openai',
      'gemini_image': 'gemini',
      'lmstudio_image': 'lmstudio'
    };
    const keyService = serviceMap[provider] || provider;
    const { data: apiKeyEntry } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', userId)
      .eq('service', keyService)
      .eq('is_active', true)
      .maybeSingle();
    hasKey = !!apiKeyEntry;
  }

  if (providerError || !hasKey) {
    const providerName = provider === 'openai_image' ? 'OpenAI (DALL-E)' : provider === 'gemini_image' ? 'Google Gemini' : 'LMStudio';
    console.log(`[IMAGE-TOOL] Provider ${provider} not configured for user ${userId}`);
    return {
      success: false,
      error: `🎨 Image generation requires an API key for **${providerName}**.\n\nTo set up:\n1. Go to **Settings → API Keys**\n2. Add your ${providerName} API key\n3. Try again\n\n💡 Tip: OpenAI DALL-E is recommended for best results.`,
      setup_required: true,
      settingsAction: { tab: 'api-keys', label: 'Add Image Provider Key' }
    };
  }

  // Call the existing generate-image edge function internally
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const requestBody: any = {
    provider,
    prompt: toolArgs.prompt,
    size: toolArgs.size || '1024x1024',
    quality: toolArgs.quality || 'standard',
    style: toolArgs.style || 'vivid',
  };

  if (toolName === 'edit_image' && toolArgs.source_image_url) {
    requestBody.sourceImageUrl = toolArgs.source_image_url;
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'x-forwarded-user-id': userId,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(`[IMAGE-TOOL] Generation failed:`, result.error);
      return {
        success: false,
        error: result.error || 'Image generation failed. Please check your API key configuration.',
      };
    }

    const imageUrl = result.imageUrl || (result.imageBase64 ? `data:image/png;base64,${result.imageBase64}` : null);

    if (!imageUrl) {
      return {
        success: false,
        error: 'Image generation returned no image data.',
      };
    }

    const generatedImage = {
      id: crypto.randomUUID(),
      url: imageUrl,
      prompt: toolArgs.prompt,
      provider: provider,
      model: result.model_used || provider,
      createdAt: new Date().toISOString(),
    };

    console.log(`[IMAGE-TOOL] ✅ Image generated successfully | model: ${generatedImage.model}`);

    return {
      success: true,
      generatedImage,
      visualData: {
        type: 'generated_image',
        generatedImage,
        title: `Generated Image`,
        subtitle: toolArgs.prompt.substring(0, 100),
      },
      message: `Image generated successfully using ${generatedImage.model}.`,
    };
  } catch (error) {
    console.error(`[IMAGE-TOOL] Error:`, error);
    return {
      success: false,
      error: `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
