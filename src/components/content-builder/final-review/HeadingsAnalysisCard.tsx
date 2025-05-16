
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export interface Heading {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  subtext?: string;
  type?: string;
}

interface HeadingsAnalysisCardProps {
  headings?: Heading[] | null;
}

export const HeadingsAnalysisCard = ({ headings }: HeadingsAnalysisCardProps) => {
  if (!headings || headings.length === 0) {
    return (
      <Card className="h-full shadow-md">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
            Recommended Headings
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] flex-col gap-2 text-center">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No heading recommendations available.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
          Recommended Headings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
        <div className="space-y-3">
          {headings.map((heading, index) => (
            <div key={index} className="border-l-4 border-teal-500/30 pl-3 py-1">
              <p className={`
                ${heading.level === 'h1' ? 'text-base font-bold' : 
                  heading.level === 'h2' ? 'text-sm font-semibold' : 
                  heading.level === 'h3' ? 'text-xs font-medium' : 'text-xs'}
              `}>
                {heading.text}
              </p>
              {heading.subtext && (
                <p className="text-xs text-muted-foreground mt-1">{heading.subtext}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <p>These heading suggestions are based on competitive analysis of top-ranking content.</p>
        </div>
      </CardContent>
    </Card>
  );
};
