
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Copy, Info, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PromptTemplate, 
  getPromptTemplates, 
  savePromptTemplate, 
  updatePromptTemplate, 
  deletePromptTemplate,
  initializeDefaultPromptTemplates 
} from '@/services/userPreferencesService';

// Content format types
const contentFormatTypes = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'social-twitter', label: 'Twitter/X Post' },
  { value: 'social-linkedin', label: 'LinkedIn Post' },
  { value: 'social-facebook', label: 'Facebook Post' },
  { value: 'social-instagram', label: 'Instagram Caption' },
  { value: 'script', label: 'Video/Podcast Script' },
  { value: 'email', label: 'Email Newsletter' },
  { value: 'infographic', label: 'Infographic Content' },
  { value: 'glossary', label: 'Glossary Entry' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'product-description', label: 'Product Description' },
  { value: 'white-paper', label: 'White Paper' },
  { value: 'press-release', label: 'Press Release' },
  { value: 'custom', label: 'Custom Format' },
];

export function PromptTemplatesSettings() {
  const [activeTab, setActiveTab] = useState('all');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<PromptTemplate> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // Load templates when component mounts
  useEffect(() => {
    const loadTemplates = async () => {
      // Initialize default templates if none exist
      await initializeDefaultPromptTemplates();
      
      // Load all templates
      const loadedTemplates = getPromptTemplates();
      setTemplates(loadedTemplates);
    };
    
    loadTemplates();
  }, []);
  
  // Group templates by format type
  const groupedTemplates = templates.reduce<Record<string, PromptTemplate[]>>((acc, template) => {
    const formatType = template.formatType || 'other';
    if (!acc[formatType]) {
      acc[formatType] = [];
    }
    acc[formatType].push(template);
    return acc;
  }, {});
  
  // Filter templates based on active tab
  const filteredTemplates = activeTab === 'all' 
    ? templates 
    : templates.filter(template => template.formatType === activeTab);
  
  // Handle creating or updating a template
  const handleSaveTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.formatType || !editingTemplate.promptTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      if (isEditing && editingTemplate.id) {
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
      
      // Refresh templates list
      setTemplates(getPromptTemplates());
      
      // Close dialog and reset form
      setDialogOpen(false);
      setEditingTemplate(null);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Error saving template:', error);
    }
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = async (template: PromptTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await deletePromptTemplate(template.id);
        setTemplates(getPromptTemplates());
        toast.success('Template deleted successfully');
      } catch (error) {
        toast.error('Failed to delete template');
        console.error('Error deleting template:', error);
      }
    }
  };
  
  // Handle duplicating a template
  const handleDuplicateTemplate = async (template: PromptTemplate) => {
    try {
      const { id, createdAt, updatedAt, ...templateData } = template;
      
      await savePromptTemplate({
        ...templateData,
        name: `${templateData.name} (Copy)`,
      });
      
      setTemplates(getPromptTemplates());
      toast.success('Template duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate template');
      console.error('Error duplicating template:', error);
    }
  };
  
  // Handle editing a template
  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  // Handle creating a new template
  const handleNewTemplate = () => {
    setEditingTemplate({
      name: '',
      formatType: 'blog',
      description: '',
      promptTemplate: '',
      structureTemplate: ''
    });
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  // Handle previewing a template
  const handlePreviewTemplate = (template: PromptTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
  };
  
  // Get format type label
  const getFormatTypeLabel = (formatType: string) => {
    const format = contentFormatTypes.find(f => f.value === formatType);
    return format ? format.label : formatType;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prompt Templates</h2>
          <p className="text-muted-foreground">
            Create and manage custom prompt templates for AI-generated content
          </p>
        </div>
        <Button onClick={handleNewTemplate} className="gap-1">
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <ScrollArea className="whitespace-nowrap pb-1">
            <TabsList className="bg-transparent">
              <TabsTrigger value="all">All</TabsTrigger>
              {Object.entries(groupedTemplates)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([formatType]) => (
                  <TabsTrigger key={formatType} value={formatType}>
                    {getFormatTypeLabel(formatType)}
                  </TabsTrigger>
                ))}
            </TabsList>
          </ScrollArea>
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">No templates found</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {activeTab === 'all' 
                      ? "You haven't created any prompt templates yet. Create your first template to get started."
                      : `You haven't created any templates for ${getFormatTypeLabel(activeTab)} yet.`}
                  </p>
                  <Button onClick={handleNewTemplate} className="mt-2">
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{getFormatTypeLabel(template.formatType)}</Badge>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive" 
                          onClick={() => handleDeleteTemplate(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="bg-muted rounded-md p-3 overflow-hidden">
                      <p className="text-xs text-muted-foreground line-clamp-4">{template.promptTemplate}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      Preview Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Template Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              Define the prompt structure for AI-generated content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input 
                  id="name" 
                  value={editingTemplate?.name || ''} 
                  onChange={e => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : prev)} 
                  placeholder="E.g. Blog Post with SEO Focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formatType">Content Format *</Label>
                <Select 
                  value={editingTemplate?.formatType || 'blog'} 
                  onValueChange={value => setEditingTemplate(prev => prev ? { ...prev, formatType: value } : prev)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentFormatTypes.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={editingTemplate?.description || ''} 
                onChange={e => setEditingTemplate(prev => prev ? { ...prev, description: e.target.value } : prev)} 
                placeholder="Brief description of this template"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promptTemplate">
                Prompt Template * <span className="text-xs text-muted-foreground">(Use {'{topic}'} to reference the content topic)</span>
              </Label>
              <Textarea 
                id="promptTemplate"
                value={editingTemplate?.promptTemplate || ''}
                onChange={e => setEditingTemplate(prev => prev ? { ...prev, promptTemplate: e.target.value } : prev)}
                placeholder="Write instructions for the AI to generate content..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="structureTemplate">
                Structure Template <span className="text-xs text-muted-foreground">(Optional - define content structure)</span>
              </Label>
              <Textarea 
                id="structureTemplate"
                value={editingTemplate?.structureTemplate || ''}
                onChange={e => setEditingTemplate(prev => prev ? { ...prev, structureTemplate: e.target.value } : prev)}
                placeholder="# Introduction\n## Section 1\n## Section 2\n# Conclusion"
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Template preview for {getFormatTypeLabel(previewTemplate?.formatType || '')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prompt Template</Label>
              <div className="bg-muted rounded-md p-4 overflow-auto max-h-[200px]">
                <pre className="text-sm whitespace-pre-wrap">{previewTemplate?.promptTemplate}</pre>
              </div>
            </div>
            
            {previewTemplate?.structureTemplate && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Structure Template</Label>
                <div className="bg-muted rounded-md p-4 overflow-auto max-h-[200px]">
                  <pre className="text-sm whitespace-pre-wrap">{previewTemplate?.structureTemplate}</pre>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setPreviewDialogOpen(false);
              handleEditTemplate(previewTemplate as PromptTemplate);
            }}>Edit Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
