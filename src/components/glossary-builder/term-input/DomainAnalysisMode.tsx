import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Search, CheckSquare, Loader2 } from 'lucide-react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';

export function DomainAnalysisMode() {
  const { state, analyzeDomain, generateDefinitions } = useGlossaryBuilder();
  const [domainUrl, setDomainUrl] = useState('');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  const handleAnalyzeDomain = async () => {
    if (domainUrl.trim()) {
      await analyzeDomain(domainUrl.trim());
    }
  };

  const handleTermSelection = (term: string, checked: boolean) => {
    if (checked) {
      setSelectedTerms([...selectedTerms, term]);
    } else {
      setSelectedTerms(selectedTerms.filter(t => t !== term));
    }
  };

  const handleGenerateDefinitions = async () => {
    if (selectedTerms.length > 0) {
      await generateDefinitions(selectedTerms);
      setSelectedTerms([]);
    }
  };

  const selectAllTerms = () => {
    setSelectedTerms([...state.suggestedTerms]);
  };

  const clearSelection = () => {
    setSelectedTerms([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain URL (e.g., https://example.com)"
              value={domainUrl}
              onChange={(e) => setDomainUrl(e.target.value)}
              disabled={state.isAnalyzing}
            />
            <Button 
              onClick={handleAnalyzeDomain}
              disabled={!domainUrl.trim() || state.isAnalyzing}
            >
              {state.isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Search className="h-4 w-4 mr-1" />
              )}
              Analyze
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>
              We'll analyze your domain's content, headings, and keywords to suggest relevant glossary terms.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {state.suggestedTerms.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Suggested Terms</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllTerms}>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.suggestedTerms.map((term, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={`term-${index}`}
                    checked={selectedTerms.includes(term)}
                    onCheckedChange={(checked) => 
                      handleTermSelection(term, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`term-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {term}
                  </label>
                </div>
              ))}
            </div>
            
            {selectedTerms.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedTerms.length} terms selected
                  </Badge>
                </div>
                <Button 
                  onClick={handleGenerateDefinitions}
                  disabled={state.isGenerating}
                >
                  {state.isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckSquare className="h-4 w-4 mr-1" />
                  )}
                  Generate Definitions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}