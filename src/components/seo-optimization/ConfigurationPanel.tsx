
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Play, Plus, X } from 'lucide-react';
import { SeoOptimizationConfig } from '@/services/seoOptimizationService';

interface ConfigurationPanelProps {
  configuration: SeoOptimizationConfig;
  onChange: (config: SeoOptimizationConfig) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
  isAnalyzing: boolean;
}

export function ConfigurationPanel({ 
  configuration, 
  onChange, 
  onAnalyze, 
  canAnalyze, 
  isAnalyzing 
}: ConfigurationPanelProps) {
  const [newKeyword, setNewKeyword] = React.useState('');

  const handleAddSecondaryKeyword = () => {
    if (newKeyword.trim() && !configuration.secondaryKeywords.includes(newKeyword.trim())) {
      onChange({
        ...configuration,
        secondaryKeywords: [...configuration.secondaryKeywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveSecondaryKeyword = (keyword: string) => {
    onChange({
      ...configuration,
      secondaryKeywords: configuration.secondaryKeywords.filter(k => k !== keyword)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-keyword">Target Keyword *</Label>
          <Input
            id="target-keyword"
            placeholder="e.g., content marketing strategy"
            value={configuration.targetKeyword}
            onChange={(e) => onChange({ ...configuration, targetKeyword: e.target.value })}
            disabled={isAnalyzing}
          />
        </div>

        <div className="space-y-2">
          <Label>Secondary Keywords</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add secondary keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSecondaryKeyword()}
              disabled={isAnalyzing}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddSecondaryKeyword}
              disabled={!newKeyword.trim() || isAnalyzing}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {configuration.secondaryKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {configuration.secondaryKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveSecondaryKeyword(keyword)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Content Type</Label>
          <Select
            value={configuration.contentType}
            onValueChange={(value: any) => onChange({ ...configuration, contentType: value })}
            disabled={isAnalyzing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="blog">Blog Post</SelectItem>
              <SelectItem value="landing-page">Landing Page</SelectItem>
              <SelectItem value="product-page">Product Page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Audience</Label>
          <Select
            value={configuration.targetAudience}
            onValueChange={(value: any) => onChange({ ...configuration, targetAudience: value })}
            disabled={isAnalyzing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Writing Style</Label>
          <Select
            value={configuration.writingStyle}
            onValueChange={(value: any) => onChange({ ...configuration, writingStyle: value })}
            disabled={isAnalyzing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
        </Button>
      </CardContent>
    </Card>
  );
}
