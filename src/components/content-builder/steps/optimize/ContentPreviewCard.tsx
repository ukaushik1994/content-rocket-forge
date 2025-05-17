
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentPreviewCardProps {
  content: string;
}

export function ContentPreviewCard({ content }: ContentPreviewCardProps) {
  return (
    <Card className="border border-white/10 h-full">
      <CardHeader className="pb-2 border-b border-white/10">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Content Preview
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[500px]">
        <CardContent className="p-4">
          {content ? (
            <div className="prose prose-invert max-w-none">
              {content.split('\n').map((line, index) => {
                // Handle headers (# Header)
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
                }
                // Handle subheaders (## Subheader)
                else if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
                }
                // Handle third level headers (### Header)
                else if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
                }
                // Empty lines
                else if (line === '') {
                  return <br key={index} />;
                }
                // Regular paragraph
                return <p key={index} className="mb-4">{line}</p>;
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-center">
              <p className="text-muted-foreground">No content generated yet</p>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
