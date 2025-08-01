import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Save, Download, FileText, Database, FileSpreadsheet, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SaveAndExportStepProps {
  onStepComplete: () => void;
}

export function SaveAndExportStep({ onStepComplete }: SaveAndExportStepProps) {
  const { state, createGlossary, exportGlossary } = useGlossaryBuilder();
  const [glossaryName, setGlossaryName] = useState('');
  const [glossaryDescription, setGlossaryDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savedGlossaryId, setSavedGlossaryId] = useState<string | null>(null);

  const terms = state.currentGlossary?.terms || [];
  const hasTerms = terms.length > 0;
  const isGlossarySaved = !!state.currentGlossary?.id || !!savedGlossaryId;

  const exportFormats = [
    {
      id: 'markdown',
      name: 'Markdown',
      description: 'Perfect for documentation and wikis',
      icon: FileText,
      extension: '.md'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data for APIs and systems',
      icon: Database,
      extension: '.json'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Spreadsheet format for analysis',
      icon: FileSpreadsheet,
      extension: '.csv'
    }
  ];

  // Handle saving glossary
  const handleSaveGlossary = async () => {
    if (!glossaryName.trim()) {
      toast.error("Please enter a glossary name");
      return;
    }

    if (!hasTerms) {
      toast.error("No terms to save");
      return;
    }

    setIsSaving(true);
    try {
      await createGlossary(glossaryName.trim(), glossaryDescription.trim() || undefined);
      setSavedGlossaryId('saved'); // Placeholder
      toast.success("Glossary saved successfully!");
      onStepComplete();
    } catch (error) {
      console.error('Error saving glossary:', error);
      toast.error("Failed to save glossary. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle export
  const handleExport = async (format: 'markdown' | 'json' | 'csv') => {
    if (!isGlossarySaved) {
      toast.error("Please save the glossary first");
      return;
    }

    setIsExporting(true);
    try {
      await exportGlossary(format);
      toast.success(`Glossary exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting glossary:', error);
      toast.error("Failed to export glossary. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasTerms) {
    return (
      <Card className="glass-card border-amber-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-amber-400 mb-4">
            <Save className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Terms to Save</h3>
          <p className="text-muted-foreground mb-4">
            Please go back and generate some definitions first.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-holographic flex items-center gap-3">
            <Save className="h-8 w-8" />
            Save & Export Glossary
          </CardTitle>
          <p className="text-muted-foreground">
            Save your glossary to the database and export it in various formats for use across different platforms.
          </p>
        </CardHeader>
      </Card>

      {/* Glossary Summary */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Glossary Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 glass-panel rounded-lg text-center">
              <div className="text-2xl font-bold text-primary mb-1">{terms.length}</div>
              <p className="text-sm text-muted-foreground">Total Terms</p>
            </div>
            <div className="p-4 glass-panel rounded-lg text-center">
              <div className="text-2xl font-bold text-neon-blue mb-1">
                {terms.filter(t => t.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="p-4 glass-panel rounded-lg text-center">
              <div className="text-2xl font-bold text-neon-pink mb-1">
                {terms.filter(t => t.searchVolume).length}
              </div>
              <p className="text-sm text-muted-foreground">With SEO Data</p>
            </div>
          </div>

          {/* Sample Terms Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Sample Terms:</p>
            <div className="flex flex-wrap gap-2">
              {terms.slice(0, 8).map((term) => (
                <Badge key={term.id} variant="outline" className="glass-card border-white/20">
                  {term.term}
                </Badge>
              ))}
              {terms.length > 8 && (
                <Badge variant="secondary" className="text-muted-foreground">
                  +{terms.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Glossary */}
      {!isGlossarySaved && (
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Save to Database
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="glossary-name" className="text-sm font-medium">
                  Glossary Name *
                </Label>
                <Input
                  id="glossary-name"
                  value={glossaryName}
                  onChange={(e) => setGlossaryName(e.target.value)}
                  placeholder="e.g., SEO Terms, Marketing Glossary, Technical Dictionary"
                  className="mt-1 glass-card border-white/20"
                />
              </div>

              <div>
                <Label htmlFor="glossary-description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="glossary-description"
                  value={glossaryDescription}
                  onChange={(e) => setGlossaryDescription(e.target.value)}
                  placeholder="Brief description of this glossary's purpose and scope"
                  className="mt-1 glass-card border-white/20 resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSaveGlossary}
                disabled={isSaving || !glossaryName.trim()}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Save className="h-5 w-5 mr-2 animate-spin" />
                    Saving Glossary...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Glossary
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {isGlossarySaved && (
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Glossary Saved Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  Your glossary has been saved to the database and is now ready for export.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-neon-blue" />
            Export Formats
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <Card key={format.id} className="glass-card border-white/20 hover:border-white/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{format.name}</h4>
                        <p className="text-xs text-muted-foreground">{format.extension}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {format.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(format.id as any)}
                      disabled={!isGlossarySaved || isExporting}
                      className="w-full glass-card border-white/20 hover:border-primary/30"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export {format.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!isGlossarySaved && (
            <div className="mt-4 p-3 glass-panel rounded-lg border border-amber-400/20">
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Save your glossary first to enable export options
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion */}
      {isGlossarySaved && (
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-primary mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-holographic mb-2">
              Glossary Builder Complete!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your glossary has been successfully created and saved. You can now export it in various formats or continue building more glossaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/glossary-builder'}
                className="glass-card border-white/20"
              >
                Create Another Glossary
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}