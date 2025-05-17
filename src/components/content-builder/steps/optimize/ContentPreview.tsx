
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ContentPreviewProps {
  content: string;
  mainKeyword: string;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  mainKeyword,
}) => {
  // Function to highlight keywords in content preview
  const highlightKeywords = (text: string, keyword: string) => {
    if (!keyword) return text;
    
    // Create a regular expression to match the keyword (case insensitive)
    const regex = new RegExp(`(${keyword})`, 'gi');
    
    // Split the text by the regex and wrap matches in a span with highlight class
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === keyword.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200/30 text-foreground px-0.5">{part}</mark>;
      }
      return part;
    });
  };
  
  return (
    <Card className="border-white/10 shadow-lg bg-gradient-to-br from-black/20 to-blue-900/10 backdrop-blur-lg">
      <CardHeader className="pb-3 border-b border-white/10">
        <CardTitle className="text-sm font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2 text-blue-500" />
          Content Preview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="max-h-[70vh] overflow-y-auto prose dark:prose-invert prose-sm">
          {content ? (
            <div className="whitespace-pre-line">
              {highlightKeywords(content, mainKeyword)}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-10">
              No content to preview. Generate content in the Writing step first.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
