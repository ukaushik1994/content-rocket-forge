import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { 
  Download, 
  Save, 
  FileText,
  Database,
  Table,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const SaveAndExportStep = () => {
  const { state, createGlossary, exportGlossary } = useGlossaryBuilder();
  const { generatedTerms, exportFormat } = state;
  
  const [glossaryName, setGlossaryName] = useState('');
  const [glossaryDescription, setGlossaryDescription] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'json' | 'csv'>('markdown');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);

  const handleSaveGlossary = async () => {
    if (!glossaryName.trim()) return;
    
    setIsSaving(true);
    try {
      await createGlossary(glossaryName, glossaryDescription);
      setSaveComplete(true);
    } catch (error) {
      console.error('Error saving glossary:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'markdown' | 'json' | 'csv') => {
    setIsExporting(true);
    try {
      await exportGlossary(format);
    } catch (error) {
      console.error('Error exporting glossary:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      value: 'markdown',
      label: 'Markdown',
      description: 'Perfect for documentation and websites',
      icon: FileText,
      extension: '.md'
    },
    {
      value: 'json',
      label: 'JSON',
      description: 'Structured data for applications',
      icon: Database,
      extension: '.json'
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Spreadsheet-compatible format',
      icon: Table,
      extension: '.csv'
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
            rotate: [0, 90, 180]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Save className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Save & Export</span>
            <Badge variant="secondary">{generatedTerms.length} terms ready</Badge>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-green-500 bg-clip-text text-transparent">
            Complete Your
            <br />
            <span className="text-primary">Glossary</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Save your glossary to the library and export it in your preferred format 
            for use across different platforms and applications.
          </p>
        </motion.div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Save to Library */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Save to Library
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="glossary-name">Glossary Name *</Label>
                  <Input
                    id="glossary-name"
                    placeholder="e.g., Software Development Glossary"
                    value={glossaryName}
                    onChange={(e) => setGlossaryName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="glossary-description">Description (Optional)</Label>
                  <Textarea
                    id="glossary-description"
                    placeholder="Brief description of this glossary's purpose and scope"
                    value={glossaryDescription}
                    onChange={(e) => setGlossaryDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="bg-background/40 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Glossary Summary</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• {generatedTerms.length} total terms</div>
                    <div>• {generatedTerms.filter(t => t.status === 'completed').length} completed definitions</div>
                    <div>• {generatedTerms.filter(t => t.relatedTerms.length > 0).length} terms with related terms</div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!saveComplete ? (
                    <Button
                      onClick={handleSaveGlossary}
                      disabled={!glossaryName.trim() || isSaving}
                      className="w-full"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Save className="h-4 w-4" />
                          </motion.div>
                          Saving Glossary...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save to Library
                        </>
                      )}
                    </Button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center"
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-700">Glossary Saved Successfully!</p>
                      <p className="text-sm text-green-600 mt-1">
                        Your glossary is now available in your library
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Export Options */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Export Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                  {formatOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.div
                        key={option.value}
                        className={`
                          flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all
                          ${selectedFormat === option.value 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-background/20 border-border/30 hover:border-primary/20'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedFormat(option.value as any)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="font-medium cursor-pointer">
                            {option.label} {option.extension}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </RadioGroup>

                <Button
                  onClick={() => handleExport(selectedFormat)}
                  disabled={generatedTerms.length === 0 || isExporting}
                  className="w-full"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Download className="h-4 w-4" />
                      </motion.div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export as {formatOptions.find(f => f.value === selectedFormat)?.label}
                    </>
                  )}
                </Button>

                <div className="bg-background/40 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Export Features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Includes all term definitions</li>
                    <li>• Related terms and relationships</li>
                    <li>• Structured for easy import</li>
                    <li>• Compatible with popular tools</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Terms Preview */}
        {generatedTerms.length > 0 && (
          <motion.div
            className="w-full max-w-7xl mx-auto mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-background/60 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle>Glossary Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {generatedTerms.slice(0, 12).map((term, index) => (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-background/40 rounded-lg border border-border/30"
                    >
                      <div className="font-medium text-sm truncate">{term.term}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {term.shortDefinition?.slice(0, 50)}...
                      </div>
                    </motion.div>
                  ))}
                </div>
                {generatedTerms.length > 12 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    And {generatedTerms.length - 12} more terms...
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};