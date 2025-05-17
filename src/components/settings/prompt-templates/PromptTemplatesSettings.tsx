
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
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
import { TemplateGrid } from './TemplateGrid';
import { TemplateDialog } from './TemplateDialog';
import { PreviewDialog } from './PreviewDialog';
import { getFormatTypeLabel } from './types';

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
  
  // Handle editing a template from preview
  const handleEditFromPreview = () => {
    setPreviewDialogOpen(false);
    if (previewTemplate) {
      handleEditTemplate(previewTemplate);
    }
  };
  
  // Handle changing template fields
  const handleChangeTemplate = (field: string, value: string) => {
    setEditingTemplate(prev => prev ? { ...prev, [field]: value } : prev);
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
          <TemplateGrid 
            templates={filteredTemplates}
            activeTab={activeTab}
            onNewTemplate={handleNewTemplate}
            onEditTemplate={handleEditTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onPreviewTemplate={handlePreviewTemplate}
          />
        </TabsContent>
      </Tabs>
      
      {/* Template Editor Dialog */}
      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTemplate={editingTemplate}
        isEditing={isEditing}
        onSave={handleSaveTemplate}
        onChangeTemplate={handleChangeTemplate}
      />
      
      {/* Template Preview Dialog */}
      <PreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        template={previewTemplate}
        onEdit={handleEditFromPreview}
      />
    </div>
  );
}
