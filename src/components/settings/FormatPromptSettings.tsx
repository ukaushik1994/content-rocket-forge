
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Pencil, Save } from 'lucide-react';
import { contentFormats, getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { 
  PromptTemplate, 
  getPromptTemplatesByType,
  savePromptTemplate,
  updatePromptTemplate,
  getPromptTemplateById
} from '@/services/userPreferencesService';

export function FormatPromptSettings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFormatId, setActiveFormatId] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Partial<PromptTemplate> | null>(null);
  
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
          const FormatIcon = getFormatByIdOrDefault(format.id).icon;
          
          return (
            <Card key={format.id} className={`cursor-pointer transition-shadow hover:shadow-md ${hasTemplate ? 'border-primary/50' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FormatIcon className="h-5 w-5" />
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
                <Button 
                  onClick={() => handleOpenEditor(format.id)} 
                  variant={hasTemplate ? "default" : "outline"} 
                  size="sm"
                  className="w-full"
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
    </div>
  );
}
