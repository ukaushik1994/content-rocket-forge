import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Type, CheckSquare, Loader2, FileText } from 'lucide-react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';

export function ManualBulkMode() {
  const { state, generateDefinitions } = useGlossaryBuilder();
  const [manualTerms, setManualTerms] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const parseTerms = (text: string): string[] => {
    return text
      .split(/[\n,;]/)
      .map(term => term.trim())
      .filter(term => term.length > 0);
  };

  const handleManualGenerate = async () => {
    const terms = parseTerms(manualTerms);
    if (terms.length > 0) {
      await generateDefinitions(terms);
      setManualTerms('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const terms = parseTerms(content);
        setManualTerms(terms.join('\n'));
      };
      reader.readAsText(file);
    }
  };

  const handleCsvGenerate = async () => {
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const terms = parseTerms(content);
        if (terms.length > 0) {
          await generateDefinitions(terms);
          setCsvFile(null);
        }
      };
      reader.readAsText(csvFile);
    }
  };

  const parsedTerms = parseTerms(manualTerms);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Manual Term Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Textarea
              placeholder="Enter terms manually, one per line or separated by commas:&#10;&#10;SEO&#10;Content Marketing&#10;Keyword Research&#10;SERP&#10;CTR"
              value={manualTerms}
              onChange={(e) => setManualTerms(e.target.value)}
              rows={8}
              disabled={state.isGenerating}
            />
            
            {parsedTerms.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {parsedTerms.length} terms detected
                  </Badge>
                  <Button 
                    onClick={handleManualGenerate}
                    disabled={state.isGenerating || parsedTerms.length === 0}
                  >
                    {state.isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <CheckSquare className="h-4 w-4 mr-1" />
                    )}
                    Generate Definitions
                  </Button>
                </div>
                
                <div className="max-h-32 overflow-y-auto p-3 bg-muted/50 rounded-lg">
                  <div className="flex flex-wrap gap-1">
                    {parsedTerms.slice(0, 20).map((term, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {term}
                      </Badge>
                    ))}
                    {parsedTerms.length > 20 && (
                      <Badge variant="outline" className="text-xs">
                        +{parsedTerms.length - 20} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Alert>
            <AlertDescription>
              Enter terms separated by new lines, commas, or semicolons. We'll generate comprehensive definitions for each term.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload a CSV file with terms
              </p>
            </label>
          </div>
          
          {csvFile && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{csvFile.name}</span>
                <Badge variant="secondary">{csvFile.size} bytes</Badge>
              </div>
              <Button 
                onClick={handleCsvGenerate}
                disabled={state.isGenerating}
                size="sm"
              >
                {state.isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <CheckSquare className="h-4 w-4 mr-1" />
                )}
                Process CSV
              </Button>
            </div>
          )}
          
          <Alert>
            <AlertDescription>
              Upload a CSV file with terms in the first column. Each row should contain one term.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}