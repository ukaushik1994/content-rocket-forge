
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Loader2, BarChart3, Plus } from 'lucide-react';
import { contentFormats, getFormatByIdOrDefault, getFormatIconComponent, ContentFormat } from '@/components/content-repurposing/formats';
import { 
  PromptTemplate, 
  getPromptTemplatesByType,
  savePromptTemplate,
  updatePromptTemplate,
} from '@/services/userPreferencesService';
import { logActivity } from '@/services/activityLogger';
import { useAuth } from '@/contexts/AuthContext';
import { enhancePromptWithFeedback, EnhancementResult } from '@/services/promptEnhancementService';
import { CategorySection, MinimalFormatCard, TemplateEditor, SearchBar } from './prompts';

export function FormatPromptSettings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFormatId, setActiveFormatId] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Partial<PromptTemplate> | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>(['social-media']); // Social Media open by default
  const { user } = useAuth();

  // Categorize formats
  const formatCategories = useMemo(() => {
    const categories = {
      'social-media': {
        title: 'Social Media',
        description: 'Posts and content for social platforms',
        formats: contentFormats.filter(f => f.id.startsWith('social-') || f.id === 'carousel' || f.id === 'meme')
      },
      'long-form': {
        title: 'Long-form Content',
        description: 'Detailed articles and structured content',
        formats: contentFormats.filter(f => ['blog', 'email', 'script'].includes(f.id))
      }
    };
    return categories;
  }, []);

  // Filter formats based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return formatCategories;
    
    const filtered: Record<string, { title: string; description: string; formats: ContentFormat[] }> = {};
    Object.entries(formatCategories).forEach(([key, category]) => {
      const matchingFormats = category.formats.filter(format =>
        format.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        format.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingFormats.length > 0) {
        filtered[key] = { ...category, formats: matchingFormats };
      }
    });
    return filtered;
  }, [formatCategories, searchQuery]);

  // Statistics
  const totalFormats = contentFormats.length;
  const configuredFormats = contentFormats.filter(f => getPromptTemplatesByType(f.id).length > 0).length;
  const filteredCount = Object.values(filteredCategories).reduce((acc, cat) => acc + cat.formats.length, 0);
  const handleOpenEditor = (formatId: string) => {
    setActiveFormatId(formatId);
    
    // Check if a template already exists
    const existingTemplates = getPromptTemplatesByType(formatId);
    const format = getFormatByIdOrDefault(formatId);
    
    if (existingTemplates.length > 0) {
      setEditingTemplate(existingTemplates[0]);
    } else {
      // Create a new template with defaults
      setEditingTemplate({
        name: format.name + " Template",
        formatType: formatId,
        description: `Default template for generating ${format.name} content`,
        promptTemplate: `Create a ${format.name} about {topic} that is engaging and informative.\n\nOriginal content to repurpose: {content}\n\nMake sure to incorporate the keyword: {keyword} if provided.`
      });
    }
    
    setDialogOpen(true);
  };
  
  const handleSaveTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.formatType || !editingTemplate.promptTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      if (editingTemplate.id) {
        // Update existing template
        await updatePromptTemplate(editingTemplate as PromptTemplate);
        toast.success('Template updated successfully');
      } else {
        // Create new template
        await savePromptTemplate({
          name: editingTemplate.name,
          formatType: editingTemplate.formatType,
          description: editingTemplate.description || '',
          promptTemplate: editingTemplate.promptTemplate,
          structureTemplate: editingTemplate.structureTemplate
        });
        toast.success('Template created successfully');
      }
      
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Error saving template:', error);
    }
  };

  const handleRefreshWithFeedback = async (formatId: string) => {
    setIsEnhancing(formatId);
    try {
      // Get existing template
      const existingTemplates = getPromptTemplatesByType(formatId);
      if (existingTemplates.length === 0) {
        toast.error('No existing template found. Create a template first.');
        return;
      }

      const currentTemplate = existingTemplates[0];
      
      // Enhance the template with AI
      const result = await enhancePromptWithFeedback(currentTemplate, 30);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to enhance template');
        return;
      }

      // Show preview dialog
      setEnhancementResult(result);
      setEditingTemplate({
        ...currentTemplate,
        promptTemplate: result.enhancedTemplate
      });
      setActiveFormatId(formatId);
      setPreviewDialogOpen(true);
      
      if (result.feedbackAnalysis) {
        toast.success(`✨ Template enhanced! ${result.feedbackAnalysis}`);
      }
    } catch (error: any) {
      console.error('Error enhancing template:', error);
      if (error.message?.includes('No recent feedback')) {
        toast.error('No recent feedback available. Create content and get reviewer feedback first.', {
          description: 'The AI needs approval feedback to improve your templates.'
        });
      } else if (error.message?.includes('AI service unavailable')) {
        toast.error('AI service is currently unavailable', {
          description: 'Please check your AI provider settings and try again.'
        });
      } else {
        toast.error('Failed to enhance template: ' + error.message);
      }
    } finally {
      setIsEnhancing(null);
    }
  };

  const handleApplyEnhancement = async () => {
    if (!editingTemplate || !editingTemplate.id) return;
    
    try {
      await updatePromptTemplate(editingTemplate as PromptTemplate);
      toast.success('🎉 Template enhanced and saved successfully!', {
        description: 'Your template now incorporates recent feedback to improve content quality.'
      });
      setPreviewDialogOpen(false);
      setEnhancementResult(null);
      
      // Log the enhancement activity
      if (user) {
        await logActivity({
          userId: user.id,
          module: 'settings',
          action: 'enhance_prompt_template',
          changeSummary: `Enhanced ${getFormatByIdOrDefault(activeFormatId).name} template using AI feedback analysis`,
          details: {
            format_type: activeFormatId,
            format_name: getFormatByIdOrDefault(activeFormatId).name,
            feedback_count: enhancementResult?.feedbackAnalysis?.match(/\d+/)?.[0] || '0',
            enhancement_type: 'ai_feedback_analysis'
          }
        });
      }
    } catch (error) {
      toast.error('Failed to save enhanced template');
      console.error('Error saving enhanced template:', error);
    }
  };


  const handleCreateAll = async () => {
    const unconfiguredFormats = contentFormats.filter(f => getPromptTemplatesByType(f.id).length === 0);
    toast.success(`Creating ${unconfiguredFormats.length} templates...`);
    // Implementation would batch create templates
  };

  const handleEnhanceAll = async () => {
    const configuredFormatIds = contentFormats
      .filter(f => getPromptTemplatesByType(f.id).length > 0)
      .map(f => f.id);
    toast.success(`Enhancing ${configuredFormatIds.length} templates...`);
    // Implementation would batch enhance templates
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Prompt Templates</h2>
        <p className="text-muted-foreground">
          Customize AI prompts for each content format
        </p>
      </div>

      {/* Search & Quick Actions */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalFormats={totalFormats}
        configuredFormats={configuredFormats}
        filteredCount={filteredCount}
        onCreateAll={handleCreateAll}
        onEnhanceAll={handleEnhanceAll}
      />

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(filteredCategories).map(([categoryId, category]) => {
          const categoryConfigured = category.formats.filter(f => 
            getPromptTemplatesByType(f.id).length > 0
          ).length;
          
          return (
            <CategorySection
              key={categoryId}
              title={category.title}
              description={category.description}
              isOpen={openCategories.includes(categoryId)}
              onToggle={() => toggleCategory(categoryId)}
              configuredCount={categoryConfigured}
              totalCount={category.formats.length}
            >
              {category.formats.map((format) => {
                const IconComponent = getFormatIconComponent(format.id);
                return (
                  <MinimalFormatCard
                    key={format.id}
                    format={format}
                    IconComponent={IconComponent}
                    onEdit={handleOpenEditor}
                    onEnhance={handleRefreshWithFeedback}
                    isEnhancing={isEnhancing === format.id}
                  />
                );
              })}
            </CategorySection>
          );
        })}
      </div>

      {/* No Results */}
      {Object.keys(filteredCategories).length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No formats match your search.</p>
          <Button
            variant="ghost"
            onClick={() => setSearchQuery('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}
      
      {/* Template Editor */}
      <TemplateEditor
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTemplate={editingTemplate}
        onTemplateChange={setEditingTemplate}
        onSave={handleSaveTemplate}
        activeFormatId={activeFormatId}
      />

      {/* Enhancement Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Enhanced Template Preview
            </DialogTitle>
            <DialogDescription>
              Review the AI-enhanced template based on recent feedback
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {enhancementResult?.feedbackAnalysis && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-purple/10 rounded-lg border border-primary/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Feedback Analysis
                </h4>
                <p className="text-sm text-muted-foreground">{enhancementResult.feedbackAnalysis}</p>
              </div>
            )}
            
            {enhancementResult?.suggestions && enhancementResult.suggestions.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg border border-secondary/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-secondary" />
                  Common Issues Addressed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {enhancementResult.suggestions.map((suggestion, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Current Template</div>
                <div className="p-3 bg-muted/30 rounded-md border">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                    {getPromptTemplatesByType(activeFormatId)[0]?.promptTemplate || 'No template found'}
                  </pre>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Enhanced Template</div>
                <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {enhancementResult?.enhancedTemplate || 'No enhancement available'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyEnhancement} className="bg-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Apply Enhancement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
