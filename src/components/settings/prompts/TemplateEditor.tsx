import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { PromptTemplate } from '@/services/userPreferencesService';
import { getFormatByIdOrDefault } from '@/components/content-repurposing/formats';

interface TemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate: Partial<PromptTemplate> | null;
  onTemplateChange: (template: Partial<PromptTemplate>) => void;
  onSave: () => void;
  activeFormatId: string;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  open,
  onOpenChange,
  editingTemplate,
  onTemplateChange,
  onSave,
  activeFormatId,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const format = getFormatByIdOrDefault(activeFormatId);
  
  const updateTemplate = (field: keyof PromptTemplate, value: string) => {
    onTemplateChange({ ...editingTemplate, [field]: value });
  };

  const placeholderPreview = editingTemplate?.promptTemplate
    ?.replace(/{topic}/g, 'AI Tools')
    ?.replace(/{content}/g, '[Original content will be inserted here]')
    ?.replace(/{keyword}/g, 'artificial intelligence') || '';

  const charCount = editingTemplate?.promptTemplate?.length || 0;
  const isLongPrompt = charCount > 500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingTemplate?.id ? 'Edit Template' : 'Create Template'}
            <Badge variant="outline" className="text-xs">
              {format.name}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Customize how content is generated for this format
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Template Name
            </Label>
            <Input
              id="name"
              value={editingTemplate?.name || ''}
              onChange={(e) => updateTemplate('name', e.target.value)}
              placeholder={`${format.name} Template`}
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="description"
              value={editingTemplate?.description || ''}
              onChange={(e) => updateTemplate('description', e.target.value)}
              placeholder="Brief description of this template"
              className="text-sm"
            />
          </div>

          {/* Main Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="promptTemplate" className="text-sm font-medium">
                Prompt Template
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={isLongPrompt ? "secondary" : "outline"} className="text-xs">
                  {charCount} chars
                </Badge>
                {isLongPrompt && (
                  <Badge variant="secondary" className="text-xs">
                    Detailed
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Textarea
                id="promptTemplate"
                rows={6}
                value={editingTemplate?.promptTemplate || ''}
                onChange={(e) => updateTemplate('promptTemplate', e.target.value)}
                placeholder={`Create a ${format.name} about {topic} that is engaging and informative.\n\nOriginal content: {content}\n\nKeyword: {keyword}`}
                className="font-mono text-sm resize-none"
              />
              
              {/* Placeholder Help */}
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-medium">Available placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">{'{topic}'}</Badge>
                    <Badge variant="outline" className="text-xs">{'{content}'}</Badge>
                    <Badge variant="outline" className="text-xs">{'{keyword}'}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          {placeholderPreview && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Live Preview</Label>
              <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {placeholderPreview}
                </pre>
              </div>
            </div>
          )}

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 justify-start p-0">
                {showAdvanced ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                Advanced Options
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="structure" className="text-sm font-medium">
                  Structure Template <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Textarea
                  id="structure"
                  rows={4}
                  value={editingTemplate?.structureTemplate || ''}
                  onChange={(e) => updateTemplate('structureTemplate', e.target.value)}
                  placeholder="# Introduction&#10;## Main Point&#10;## Secondary Point&#10;# Conclusion"
                  className="font-mono text-sm"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditor;