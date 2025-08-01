
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Save, Eye, Wand2, RefreshCw } from 'lucide-react';
import { useContentTemplates } from '@/contexts/ContentTemplatesContext';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';

export const TemplateBuilder = () => {
  const { state, dispatch } = useContentTemplates();
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    structure: '',
    promptTemplate: '',
    variables: [] as string[]
  });
  const [variableInputs, setVariableInputs] = useState<Record<string, string>>({});

  const handleFormChange = (field: string, value: string) => {
    setTemplateForm(prev => ({
      ...prev,
      [field]: value,
      // Auto-extract variables when prompt template changes
      ...(field === 'promptTemplate' ? {
        variables: templateService.extractVariables(value)
      } : {})
    }));
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.promptTemplate) {
      toast.error('Please fill in template name and prompt template');
      return;
    }

    const newTemplate = templateService.createCustomTemplate(templateForm);
    dispatch({ type: 'ADD_CUSTOM_TEMPLATE', payload: newTemplate });
    toast.success('Template saved successfully!');
    
    // Reset form
    setTemplateForm({
      name: '',
      description: '',
      structure: '',
      promptTemplate: '',
      variables: []
    });
  };

  const handleGeneratePreview = async () => {
    if (!state.selectedTemplate || !state.selectedTemplate.variables.length) return;

    dispatch({ type: 'SET_GENERATING', payload: true });
    
    try {
      const content = await templateService.generateContent(
        state.selectedTemplate,
        variableInputs
      );
      dispatch({ type: 'SET_GENERATED_CONTENT', payload: content });
      dispatch({ type: 'UPDATE_TEMPLATE_USAGE', payload: { id: state.selectedTemplate.id } });
    } catch (error) {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Custom Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Custom Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="My Custom Template"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={templateForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Brief description of the template"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="template-structure">Content Structure (optional)</Label>
            <Textarea
              id="template-structure"
              value={templateForm.structure}
              onChange={(e) => handleFormChange('structure', e.target.value)}
              placeholder="Outline the structure (e.g., Introduction, Main Points, Conclusion)"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="prompt-template">Prompt Template</Label>
            <Textarea
              id="prompt-template"
              value={templateForm.promptTemplate}
              onChange={(e) => handleFormChange('promptTemplate', e.target.value)}
              placeholder="Write a {contentType} about {topic} for {audience}. Include {keyPoints}."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {`{variableName}`} for dynamic content. Variables will be extracted automatically.
            </p>
          </div>

          {templateForm.variables.length > 0 && (
            <div>
              <Label>Detected Variables</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {templateForm.variables.map((variable) => (
                  <Badge key={variable} variant="outline">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSaveTemplate} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </CardContent>
      </Card>

      {/* Template Preview/Generator */}
      {state.selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Generate Content: {state.selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.selectedTemplate.variables.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <Label htmlFor={`var-${variable}`} className="capitalize">
                        {variable.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Input
                        id={`var-${variable}`}
                        value={variableInputs[variable] || ''}
                        onChange={(e) => setVariableInputs(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        placeholder={`Enter ${variable}...`}
                      />
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleGeneratePreview}
                  disabled={state.isGenerating}
                  className="w-full"
                >
                  {state.isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </>
            )}

            {state.generatedContent && (
              <>
                <Separator />
                <div>
                  <Label>Generated Content</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {state.generatedContent}
                    </pre>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                    navigator.clipboard.writeText(state.generatedContent);
                    toast.success('Content copied to clipboard!');
                  }}>
                    Copy to Clipboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
