
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Pencil, Save, Sparkles, Loader2 } from 'lucide-react';
// Import both the contentFormats array and the getFormatIconComponent function 
import { contentFormats, getFormatByIdOrDefault, getFormatIconComponent } from '@/components/content-repurposing/formats';
import { 
  PromptTemplate, 
  getPromptTemplatesByType,
  savePromptTemplate,
  updatePromptTemplate,
  getPromptTemplateById
} from '@/services/userPreferencesService';
import { logActivity } from '@/services/activityLogger';
import { useAuth } from '@/contexts/AuthContext';
import { enhancePromptWithFeedback, EnhancementResult } from '@/services/promptEnhancementService';

export function FormatPromptSettings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFormatId, setActiveFormatId] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Partial<PromptTemplate> | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const { user } = useAuth();
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
        toast.success(result.feedbackAnalysis);
      }
    } catch (error: any) {
      console.error('Error enhancing template:', error);
      toast.error('Failed to enhance template: ' + error.message);
    } finally {
      setIsEnhancing(null);
    }
  };

  const handleApplyEnhancement = async () => {
    if (!editingTemplate || !editingTemplate.id) return;
    
    try {
      await updatePromptTemplate(editingTemplate as PromptTemplate);
      toast.success('Template enhanced and saved successfully!');
      setPreviewDialogOpen(false);
      setEnhancementResult(null);
    } catch (error) {
      toast.error('Failed to save enhanced template');
      console.error('Error saving enhanced template:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Format Prompt Templates</h2>
        <p className="text-muted-foreground">
          Customize prompts used for generating different content formats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentFormats.map((format) => {
          const existingTemplates = getPromptTemplatesByType(format.id);
          const hasTemplate = existingTemplates.length > 0;
          // Get the icon component using the helper function
          const IconComponent = getFormatIconComponent(format.id);
          
          return (
            <Card key={format.id} className={`cursor-pointer transition-shadow hover:shadow-md ${hasTemplate ? 'border-primary/50' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {format.name}
                  {hasTemplate && (
                    <span className="text-xs bg-primary/20 text-primary py-0.5 px-1.5 rounded-full">
                      Custom
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{format.description}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleOpenEditor(format.id)} 
                    variant={hasTemplate ? "default" : "outline"} 
                    size="sm"
                    className="flex-1"
                  >
                    {hasTemplate ? (
                      <>
                        <Pencil className="h-3 w-3 mr-1" /> Edit Template
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" /> Create Template
                      </>
                    )}
                  </Button>
                  
                  {hasTemplate && (
                    <Button 
                      onClick={() => handleRefreshWithFeedback(format.id)}
                      variant="outline" 
                      size="sm"
                      disabled={isEnhancing === format.id}
                      className="px-2"
                      title="Refresh with AI Feedback"
                    >
                      {isEnhancing === format.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? 'Edit Template' : 'Create Template'} for {getFormatByIdOrDefault(activeFormatId).name}
            </DialogTitle>
            <DialogDescription>
              Customize how content is generated for this format
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input 
                id="name"
                value={editingTemplate?.name || ''}
                onChange={(e) => setEditingTemplate(prev => ({...prev!, name: e.target.value}))}
                placeholder="Enter template name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description"
                value={editingTemplate?.description || ''}
                onChange={(e) => setEditingTemplate(prev => ({...prev!, description: e.target.value}))}
                placeholder="Brief description of this template"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promptTemplate">
                Prompt Template <span className="text-xs text-muted-foreground">(Use {'{topic}'}, {'{content}'}, and {'{keyword}'} as placeholders)</span>
              </Label>
              <Textarea
                id="promptTemplate"
                rows={8} 
                value={editingTemplate?.promptTemplate || ''}
                onChange={(e) => setEditingTemplate(prev => ({...prev!, promptTemplate: e.target.value}))}
                placeholder="Enter your prompt template..."
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="structure">
                Structure Template <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea 
                id="structure"
                rows={5}
                value={editingTemplate?.structureTemplate || ''}
                onChange={(e) => setEditingTemplate(prev => ({...prev!, structureTemplate: e.target.value}))}
                placeholder="# Introduction\n## Main Point\n## Secondary Point\n# Conclusion"
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Feedback Analysis</h4>
                <p className="text-sm text-muted-foreground">{enhancementResult.feedbackAnalysis}</p>
              </div>
            )}
            
            {enhancementResult?.suggestions && enhancementResult.suggestions.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Common Issues Addressed</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {enhancementResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Template</Label>
                <div className="p-3 bg-muted/30 rounded-md border">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                    {getPromptTemplatesByType(activeFormatId)[0]?.promptTemplate || 'No template found'}
                  </pre>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Enhanced Template</Label>
                <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {enhancementResult?.enhancedTemplate || 'No enhancement available'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enhanced-template">Edit Enhanced Template (Optional)</Label>
              <Textarea
                id="enhanced-template"
                rows={8}
                value={editingTemplate?.promptTemplate || ''}
                onChange={(e) => setEditingTemplate(prev => ({...prev!, promptTemplate: e.target.value}))}
                className="font-mono text-sm"
              />
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
