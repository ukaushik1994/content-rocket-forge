
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromptTemplate } from '@/services/userPreferences';
import { contentFormatTypes } from './types';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate: Partial<PromptTemplate> | null;
  isEditing: boolean;
  onSave: () => void;
  onChangeTemplate: (field: string, value: string) => void;
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onOpenChange,
  editingTemplate,
  isEditing,
  onSave,
  onChangeTemplate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={e => onChangeTemplate('name', e.target.value)} 
                placeholder="E.g. Blog Post with SEO Focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formatType">Content Format *</Label>
              <Select 
                value={editingTemplate?.formatType || 'blog'} 
                onValueChange={value => onChangeTemplate('formatType', value)}
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
              onChange={e => onChangeTemplate('description', e.target.value)} 
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
              onChange={e => onChangeTemplate('promptTemplate', e.target.value)}
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
              onChange={e => onChangeTemplate('structureTemplate', e.target.value)}
              placeholder="# Introduction\n## Section 1\n## Section 2\n# Conclusion"
              className="min-h-[150px] font-mono text-sm"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave}>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
