import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, Settings, ExternalLink, Plus, Edit3 } from 'lucide-react';
import { PromptTemplate, getPromptTemplates } from '@/services/userPreferencesService';
import { contentFormats, getFormatIconComponent } from '@/components/content-repurposing/formats';
import { useNavigate } from 'react-router-dom';

interface TemplatePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect?: (template: PromptTemplate) => void;
  selectedFormatType?: string;
}

export const TemplatePopup: React.FC<TemplatePopupProps> = ({
  open,
  onOpenChange,
  onTemplateSelect,
  selectedFormatType
}) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [groupedTemplates, setGroupedTemplates] = useState<Record<string, PromptTemplate[]>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = () => {
    const allTemplates = getPromptTemplates();
    setTemplates(allTemplates);
    
    // Group templates by format type
    const grouped = allTemplates.reduce((acc, template) => {
      if (!acc[template.formatType]) {
        acc[template.formatType] = [];
      }
      acc[template.formatType].push(template);
      return acc;
    }, {} as Record<string, PromptTemplate[]>);
    
    setGroupedTemplates(grouped);
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    onTemplateSelect?.(template);
    onOpenChange(false);
  };

  const handleGoToSettings = () => {
    navigate('/settings?tab=promptTemplates');
    onOpenChange(false);
  };

  const getFormatInfo = (formatType: string) => {
    return contentFormats.find(f => f.id === formatType) || {
      id: formatType,
      name: formatType.charAt(0).toUpperCase() + formatType.slice(1),
      description: `Custom format: ${formatType}`,
      icon: FileText
    };
  };

  const filteredFormats = selectedFormatType 
    ? [selectedFormatType] 
    : Object.keys(groupedTemplates);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Templates
            <Badge variant="secondary" className="ml-2">
              {templates.length} templates
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {selectedFormatType 
              ? `Templates for ${getFormatInfo(selectedFormatType).name} format`
              : 'View and select from your custom content templates'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <Separator />
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
              <p className="text-muted-foreground mb-6">
                Create custom templates to improve your content generation quality and consistency.
              </p>
              <Button onClick={handleGoToSettings} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Templates
              </Button>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {filteredFormats.map((formatType) => {
                const formatInfo = getFormatInfo(formatType);
                const IconComponent = getFormatIconComponent(formatType);
                const formatTemplates = groupedTemplates[formatType] || [];

                return (
                  <div key={formatType} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{formatInfo.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {formatTemplates.length} template{formatTemplates.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <div className="grid gap-3">
                      {formatTemplates.map((template) => (
                        <Card 
                          key={template.id} 
                          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base font-medium">
                                  {template.name}
                                </CardTitle>
                                {template.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {template.description}
                                  </p>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Custom
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="bg-muted/50 rounded-md p-3">
                              <p className="text-xs text-muted-foreground line-clamp-3">
                                {template.promptTemplate.length > 150 
                                  ? `${template.promptTemplate.substring(0, 150)}...`
                                  : template.promptTemplate
                                }
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-muted-foreground">
                                Updated {new Date(template.updatedAt).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Edit3 className="h-3 w-3" />
                                Click to use
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-6 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Templates are used to customize content generation for each format
            </p>
            <Button 
              variant="outline" 
              onClick={handleGoToSettings}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Templates
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};