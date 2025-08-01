import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Search, CheckSquare, Loader2 } from 'lucide-react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';

export function TopicSuggestionMode() {
  const { state, suggestTopicTerms, generateDefinitions } = useGlossaryBuilder();
  const [topic, setTopic] = useState('');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  const handleSuggestTerms = async () => {
    if (topic.trim()) {
      await suggestTopicTerms(topic.trim());
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

  const topicExamples = [
    'Digital Marketing',
    'SEO & Content',
    'E-commerce',
    'SaaS & Technology',
    'Project Management',
    'Finance & Accounting'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Topic-Based Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a topic or industry (e.g., Digital Marketing, SEO)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={state.isAnalyzing}
            />
            <Button 
              onClick={handleSuggestTerms}
              disabled={!topic.trim() || state.isAnalyzing}
            >
              {state.isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Search className="h-4 w-4 mr-1" />
              )}
              Suggest
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>
              AI will suggest relevant terms and concepts commonly used in your specified topic or industry.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">Popular Topics:</p>
            <div className="flex flex-wrap gap-2">
              {topicExamples.map((example) => (
                <Badge
                  key={example}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setTopic(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {state.suggestedTerms.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI-Suggested Terms for "{topic}"</CardTitle>
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
                    id={`topic-term-${index}`}
                    checked={selectedTerms.includes(term)}
                    onCheckedChange={(checked) => 
                      handleTermSelection(term, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`topic-term-${index}`}
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