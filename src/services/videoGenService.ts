import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';

export interface VideoGenerationRequest {
  prompt: string;
  mode?: 'text-to-video' | 'image-to-video';
  sourceImageUrl?: string;
  duration?: 5 | 10;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  provider?: 'runway_video' | 'kling_video' | 'replicate_video';
  model?: string;
}

export interface GeneratedVideo {
  id: string;
  url?: string;
  thumbnailUrl?: string;
  prompt: string;
  provider: string;
  model: string;
  duration: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  taskId?: string;
  progress?: number;
  error?: string;
  createdAt: string;
}

export interface VideoGenProviderInfo {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  isConfigured: boolean;
  models: string[];
}

export interface VideoGenerationTask {
  id: string;
  taskId: string;
  provider: 'runway_video' | 'kling_video' | 'replicate_video';
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  video?: GeneratedVideo;
  startedAt: string;
  estimatedTime?: number;
}

class VideoGenService {
  private static instance: VideoGenService;
  private activeTasks: Map<string, VideoGenerationTask> = new Map();
  private pollingIntervals: Map<string, number> = new Map();

  static getInstance(): VideoGenService {
    if (!VideoGenService.instance) {
      VideoGenService.instance = new VideoGenService();
    }
    return VideoGenService.instance;
  }

  /**
   * Get active video generation provider
   */
  async getActiveVideoProvider(): Promise<VideoGenProviderInfo | null> {
    try {
      const providers = await AIServiceController.getAllProviders();
      
      // Find active video generation provider
      const videoProviders = providers.filter(p => 
        p.category === 'Image/Video Gen' && 
        p.capabilities?.includes('video-generation')
      );
      const activeProvider = videoProviders.find(p => p.status === 'active' && p.is_configured);
      
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
      console.error('Error getting active video provider:', error);
      return null;
    }
  }

  /**
   * Get all configured video generation providers
   */
  async getAllVideoProviders(): Promise<VideoGenProviderInfo[]> {
    try {
      const providers = await AIServiceController.getAllProviders();
      
      return providers
        .filter(p => 
          p.category === 'Image/Video Gen' && 
          p.capabilities?.includes('video-generation')
        )
        .map(p => ({
          id: p.id,
          name: p.name,
          status: p.status as 'active' | 'inactive' | 'error',
          isConfigured: p.is_configured || false,
          models: p.available_models
        }));
    } catch (error) {
      console.error('Error getting video providers:', error);
      return [];
    }
  }

  /**
   * Start video generation
   * Returns a task ID that can be used to poll for status
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationTask | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to generate videos');
        return null;
      }

      // Determine provider to use
      let providerToUse = request.provider;
      
      if (!providerToUse) {
        const activeProvider = await this.getActiveVideoProvider();
        if (!activeProvider) {
          toast.error('No video generation provider configured. Please set up a provider in Settings.');
          return null;
        }
        providerToUse = activeProvider.id as 'runway_video' | 'kling_video' | 'replicate_video';
      }

      console.log(`🎬 Starting video generation with ${providerToUse}...`);
      
      const toastId = toast.loading('Starting video generation...', {
        description: 'This may take 1-2 minutes'
      });

      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          provider: providerToUse,
          prompt: request.prompt,
          mode: request.mode || 'text-to-video',
          sourceImageUrl: request.sourceImageUrl,
          duration: request.duration || 5,
          aspectRatio: request.aspectRatio || '16:9',
          model: request.model
        }
      });

      if (error) {
        console.error('Video generation error:', error);
        toast.error(`Video generation failed: ${error.message}`, { id: toastId });
        return null;
      }

      if (!data?.success) {
        console.error('Video generation failed:', data?.error);
        toast.error(data?.error || 'Video generation failed', { id: toastId });
        return null;
      }

      // Create task for tracking
      const taskId = crypto.randomUUID();
      const task: VideoGenerationTask = {
        id: taskId,
        taskId: data.taskId,
        provider: providerToUse,
        prompt: request.prompt,
        status: 'generating',
        startedAt: new Date().toISOString(),
        estimatedTime: data.estimatedTime,
      };

      this.activeTasks.set(taskId, task);

      toast.success('Video generation started', {
        id: toastId,
        description: `Estimated time: ${data.estimatedTime || 60} seconds`
      });

      return task;
    } catch (error: any) {
      console.error('Error starting video generation:', error);
      toast.error(error.message || 'Failed to start video generation');
      return null;
    }
  }

  /**
   * Check the status of a video generation task
   */
  async checkVideoStatus(task: VideoGenerationTask): Promise<VideoGenerationTask> {
    try {
      const { data, error } = await supabase.functions.invoke('check-video-status', {
        body: {
          taskId: task.taskId,
          provider: task.provider
        }
      });

      if (error) {
        console.error('Status check error:', error);
        return { ...task, status: 'failed' };
      }

      const updatedTask: VideoGenerationTask = {
        ...task,
        status: data.status,
      };

      if (data.status === 'completed' && data.videoUrl) {
        updatedTask.video = {
          id: crypto.randomUUID(),
          url: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl,
          prompt: task.prompt,
          provider: task.provider,
          model: 'default',
          duration: 5,
          status: 'completed',
          taskId: task.taskId,
          createdAt: new Date().toISOString()
        };
        toast.success('Video generated successfully!');
      } else if (data.status === 'failed') {
        toast.error(`Video generation failed: ${data.error || 'Unknown error'}`);
      }

      this.activeTasks.set(task.id, updatedTask);
      return updatedTask;
    } catch (error: any) {
      console.error('Error checking video status:', error);
      return { ...task, status: 'failed' };
    }
  }

  /**
   * Start polling for video completion
   */
  startPolling(
    task: VideoGenerationTask, 
    onUpdate: (task: VideoGenerationTask) => void,
    intervalMs: number = 5000
  ): void {
    // Clear any existing polling for this task
    this.stopPolling(task.id);

    const poll = async () => {
      const updatedTask = await this.checkVideoStatus(task);
      onUpdate(updatedTask);

      if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
        this.stopPolling(task.id);
      }
    };

    // Initial check
    poll();

    // Set up interval
    const intervalId = window.setInterval(poll, intervalMs);
    this.pollingIntervals.set(task.id, intervalId);
  }

  /**
   * Stop polling for a specific task
   */
  stopPolling(taskId: string): void {
    const intervalId = this.pollingIntervals.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(taskId);
    }
  }

  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.pollingIntervals.clear();
  }

  /**
   * Get active tasks
   */
  getActiveTasks(): VideoGenerationTask[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Attach generated video to a content item
   */
  async attachVideoToContent(
    contentId: string, 
    video: GeneratedVideo
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return false;
      }

      // Get current content item
      const { data: content, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch content:', fetchError);
        toast.error('Failed to attach video');
        return false;
      }

      // Append new video to existing videos
      const existingVideos = ((content as any)?.generated_videos as GeneratedVideo[]) || [];
      const updatedVideos = [...existingVideos, video];

      // Update content item
      const { error: updateError } = await supabase
        .from('content_items')
        .update({ 
          generated_videos: updatedVideos as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update content:', updateError);
        toast.error('Failed to attach video');
        return false;
      }

      toast.success('Video attached to content');
      return true;
    } catch (error: any) {
      console.error('Error attaching video:', error);
      toast.error(error.message || 'Failed to attach video');
      return false;
    }
  }

  /**
   * Remove a video from a content item
   */
  async removeVideoFromContent(
    contentId: string,
    videoId: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return false;
      }

      // Get current content item
      const { data: content, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch content:', fetchError);
        toast.error('Failed to remove video');
        return false;
      }

      // Filter out the video
      const existingVideos = ((content as any)?.generated_videos as GeneratedVideo[]) || [];
      const updatedVideos = existingVideos.filter(vid => vid.id !== videoId);

      // Update content item
      const { error: updateError } = await supabase
        .from('content_items')
        .update({ 
          generated_videos: updatedVideos as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update content:', updateError);
        toast.error('Failed to remove video');
        return false;
      }

      toast.success('Video removed');
      return true;
    } catch (error: any) {
      console.error('Error removing video:', error);
      toast.error(error.message || 'Failed to remove video');
      return false;
    }
  }
}

export default VideoGenService.getInstance();
