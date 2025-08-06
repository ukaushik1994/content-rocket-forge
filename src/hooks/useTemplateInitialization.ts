import { useEffect, useState } from 'react';
import { initializeDefaultPromptTemplates, getPromptTemplates } from '@/services/userPreferencesService';
import { toast } from 'sonner';

interface TemplateInitializationStatus {
  isInitialized: boolean;
  isLoading: boolean;
  templateCount: number;
  error: string | null;
}

export const useTemplateInitialization = () => {
  const [status, setStatus] = useState<TemplateInitializationStatus>({
    isInitialized: false,
    isLoading: true,
    templateCount: 0,
    error: null
  });

  useEffect(() => {
    const initializeTemplates = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Check if templates already exist
        const existingTemplates = getPromptTemplates();
        
        if (existingTemplates.length === 0) {
          console.log('📝 No prompt templates found, initializing defaults...');
          await initializeDefaultPromptTemplates();
          
          const newTemplates = getPromptTemplates();
          console.log(`✅ Initialized ${newTemplates.length} default prompt templates`);
          
          setStatus({
            isInitialized: true,
            isLoading: false,
            templateCount: newTemplates.length,
            error: null
          });
          
          toast.success(`Initialized ${newTemplates.length} content templates`, {
            description: 'Templates are ready for content generation'
          });
        } else {
          console.log(`📝 Found ${existingTemplates.length} existing prompt templates`);
          setStatus({
            isInitialized: true,
            isLoading: false,
            templateCount: existingTemplates.length,
            error: null
          });
        }
      } catch (error) {
        console.error('❌ Failed to initialize templates:', error);
        setStatus({
          isInitialized: false,
          isLoading: false,
          templateCount: 0,
          error: error instanceof Error ? error.message : 'Failed to initialize templates'
        });
        
        toast.error('Failed to initialize content templates', {
          description: 'Some features may use default prompts instead'
        });
      }
    };

    initializeTemplates();
  }, []);

  return status;
};