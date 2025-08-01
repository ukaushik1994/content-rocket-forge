
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Type, Clock } from 'lucide-react';

interface ContentInputProps {
  content: string;
  onChange: (content: string) => void;
  isAnalyzing: boolean;
}

export function ContentInput({ content, onChange, isAnalyzing }: ContentInputProps) {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your existing content here for SEO analysis and optimization..."
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[300px] resize-none"
          disabled={isAnalyzing}
        />
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Type className="h-3 w-3" />
            {wordCount} words
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {charCount} chars
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ~{estimatedReadTime} min read
          </Badge>
        </div>

        {wordCount > 0 && (
          <div className="text-xs text-muted-foreground">
            {wordCount < 300 && "Consider adding more content for better SEO results"}
            {wordCount >= 300 && wordCount < 1000 && "Good length for analysis"}
            {wordCount >= 1000 && "Comprehensive content length"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
