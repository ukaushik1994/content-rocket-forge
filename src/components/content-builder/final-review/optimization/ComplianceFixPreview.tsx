import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Loader2, ArrowRight, Undo } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ComplianceFixPreviewProps {
  originalContent: string;
  fixedContent: string | null;
  selectedViolations: any[];
  appliedFixes: string[];
  isGeneratingFix: boolean;
  onApplyFixes: () => void;
  onGeneratePreview: () => void;
  onCancel: () => void;
  onUndo?: () => void;
  showUndoOption?: boolean;
}

export const ComplianceFixPreview: React.FC<ComplianceFixPreviewProps> = ({
  originalContent,
  fixedContent,
  selectedViolations,
  appliedFixes,
  isGeneratingFix,
  onApplyFixes,
  onGeneratePreview,
  onCancel,
  onUndo,
  showUndoOption = false
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'diff' | 'summary'>('preview');

  const hasChanges = fixedContent && fixedContent !== originalContent;

  if (isGeneratingFix) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating AI Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Processing {selectedViolations.length} compliance violations...
            </p>
            <div className="space-y-2">
              {selectedViolations.map((violation, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{violation.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fixedContent) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>AI Compliance Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Selected {selectedViolations.length} violations for AI-powered fixes:
            </p>
            <div className="space-y-2">
              {selectedViolations.map((violation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <Badge variant={violation.severity === 'critical' ? 'destructive' : violation.severity === 'major' ? 'default' : 'secondary'}>
                    {violation.severity}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">{violation.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{violation.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={onGeneratePreview} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Generate Fix Preview
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fix Preview</CardTitle>
          {showUndoOption && (
            <Button variant="outline" size="sm" onClick={onUndo} className="flex items-center gap-2">
              <Undo className="h-4 w-4" />
              Undo Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Fixed Content</TabsTrigger>
            <TabsTrigger value="diff">Before/After</TabsTrigger>
            <TabsTrigger value="summary">Fix Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="bg-background border rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                {fixedContent.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="diff" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <X className="h-4 w-4 text-destructive" />
                  Original Content
                </h4>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="text-sm leading-relaxed">
                    {originalContent.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Fixed Content
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="text-sm leading-relaxed">
                    {fixedContent.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Applied Fixes</h4>
              {appliedFixes.length > 0 ? (
                <div className="space-y-2">
                  {appliedFixes.map((fix, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{fix}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No fixes were applied. The content may already be compliant.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />
        
        <div className="flex gap-3 justify-end">
          {hasChanges ? (
            <>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onApplyFixes} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Apply Fixes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onGeneratePreview}>
                Regenerate Fixes
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Close
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};