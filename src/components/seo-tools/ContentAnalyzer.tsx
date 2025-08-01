
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Link, Zap } from 'lucide-react';
import { useSeoOptimization } from '@/contexts/SeoOptimizationContext';
import { seoAnalysisService } from '@/services/seoAnalysisService';
import { toast } from 'sonner';

export const ContentAnalyzer = () => {
  const { state, dispatch } = useSeoOptimization();
  const [targetKeyword, setTargetKeyword] = useState('');
  const [url, setUrl] = useState('');

  const handleAnalyze = async () => {
    if (!state.content || state.content.length < 100) {
      toast.error('Please enter at least 100 characters of content');
      return;
    }

    dispatch({ type: 'SET_ANALYZING', payload: true });
    
    try {
      const analysis = await seoAnalysisService.analyzeContent(state.content, targetKeyword);
      dispatch({ type: 'SET_ANALYSIS', payload: analysis });
      dispatch({ type: 'ADD_HISTORY', payload: { 
        timestamp: Date.now(), 
        score: analysis.score, 
        content: state.content.substring(0, 100) + '...' 
      }});
      toast.success('Content analysis completed!');
    } catch (error) {
      dispatch({ type: 'SET_ANALYZING', payload: false });
      toast.error('Analysis failed. Please try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        dispatch({ type: 'SET_CONTENT', payload: content });
      };
      reader.readAsText(file);
    } else {
      toast.error('Please upload a text file (.txt)');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="keyword">Target Keyword (optional)</Label>
            <Input
              id="keyword"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="Enter your target keyword..."
            />
          </div>
          <div>
            <Label htmlFor="url">Import from URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
              />
              <Button variant="outline" size="sm">
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="content">Content to Analyze</Label>
            <div className="flex gap-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          <Textarea
            id="content"
            value={state.content}
            onChange={(e) => dispatch({ type: 'SET_CONTENT', payload: e.target.value })}
            placeholder="Paste your content here for SEO analysis..."
            className="min-h-[300px] resize-y"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {state.content.length} characters, {state.content.split(/\s+/).filter(w => w.length > 0).length} words
          </div>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={state.isAnalyzing || state.content.length < 100}
          className="w-full"
        >
          {state.isAnalyzing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-pulse" />
              Analyzing Content...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Analyze SEO Performance
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
